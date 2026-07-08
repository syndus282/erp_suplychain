import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { createApprovalRequest } from "@/modules/workflow/lib/approval";
import { reserveStock, releaseReservation } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

/** Chiết khấu tối đa cho phép so với giá niêm yết (PriceListItem) trước khi cần phê duyệt. */
const MAX_DISCOUNT_RATIO_WITHOUT_APPROVAL = 0.2;

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative().optional(),
  tax: z.number().int().nonnegative().optional(),
});

const createSchema = z.object({
  quotationId: z.string().nullable().optional(),
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  salesRepId: z.string().nullable().optional(),
  salesChannel: z.enum(["ONLINE", "OFFLINE"]).optional(),
  deliveryAddress: z.string().optional(),
  paymentTerm: z.string().optional(),
  expectedDeliveryDate: optionalDateInput(),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const confirmSchema = z.object({
  approverUserId: z.string().optional(),
});

const allocateSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho xuất hàng"),
});

const include = {
  customer: true,
  quotation: { select: { id: true, code: true } },
  lines: { include: { product: true, reservations: true } },
};

function computeLineTotal(line: { unitPrice: number; qty: number; discount?: number; tax?: number }) {
  const discount = line.discount ?? 0;
  const tax = line.tax ?? 0;
  return Math.round(line.unitPrice * line.qty) - discount + tax;
}

export async function listSalesOrders(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.salesOrder.findMany({ where, orderBy, skip, take, include }),
    prisma.salesOrder.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function getSalesOrder(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "read");

  const so = await prisma.salesOrder.findUnique({ where: { id }, include });
  if (!so || so.companyId !== session.companyId) throw notFoundError();
  return apiSuccess(so);
}

export async function createSalesOrder(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) {
    throw validationError("Khách hàng không hợp lệ");
  }

  const { lines, ...fields } = input;

  const created = await prisma.salesOrder.create({
    data: {
      ...fields,
      companyId: session.companyId,
      code: generateCode("SO"),
      status: "DRAFT",
      lines: {
        create: lines.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          discount: line.discount ?? 0,
          tax: line.tax ?? 0,
          totalAmount: computeLineTotal(line),
        })),
      },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function confirmSalesOrder(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "confirm");

  const input = confirmSchema.parse(await request.json().catch(() => ({})));

  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { lines: true, customer: { include: { priceList: { include: { items: true } } } } },
  });
  if (!so || so.companyId !== session.companyId) throw notFoundError();
  if (so.status !== "DRAFT") {
    throw businessRuleError("Chỉ có thể xác nhận đơn hàng đang ở trạng thái Nháp", {
      rule: "SO_NOT_DRAFT",
      currentStatus: so.status,
    });
  }

  const orderTotal = so.lines.reduce((sum, l) => sum + l.totalAmount, 0);

  // Kiểm tra hạn mức tín dụng (docs/business-spec/05 mục 15) — chặn cứng,
  // không có override (nhất quán với cách recordStockMovement chặn âm kho).
  if (so.customer.creditLimit > 0 && so.customer.currentDebt + orderTotal > so.customer.creditLimit) {
    throw businessRuleError("Đơn hàng vượt hạn mức tín dụng còn lại của khách hàng", {
      rule: "CREDIT_LIMIT_EXCEEDED",
      creditLimit: so.customer.creditLimit,
      currentDebt: so.customer.currentDebt,
      orderTotal,
    });
  }

  // Kiểm tra chính sách giá (mục 12): nếu bán thấp hơn giá niêm yết quá mức
  // cho phép, bắt buộc phải qua phê duyệt thay vì tự động Confirmed.
  const priceItems = so.customer.priceList?.items ?? [];
  const needsApproval = so.lines.some((line) => {
    const listItem = priceItems.find((item) => item.productId === line.productId);
    if (!listItem || listItem.unitPrice <= 0) return false;
    const floor = listItem.unitPrice * (1 - MAX_DISCOUNT_RATIO_WITHOUT_APPROVAL);
    return line.unitPrice < floor;
  });

  if (needsApproval) {
    if (!input.approverUserId) {
      throw validationError("Đơn hàng có chiết khấu vượt mức cho phép, phải chọn người phê duyệt");
    }
    const approver = await prisma.user.findUnique({ where: { id: input.approverUserId } });
    if (!approver || approver.companyId !== session.companyId) {
      throw validationError("Người duyệt không hợp lệ");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.salesOrder.update({ where: { id }, data: { status: "PENDING_APPROVAL" }, include });
      await createApprovalRequest(
        {
          companyId: session.companyId,
          entityType: "SalesOrder",
          entityId: id,
          requestedById: session.sub,
          approverUserId: input.approverUserId!,
        },
        tx
      );
      return result;
    });
    return apiSuccess(updated);
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
    include,
  });
  return apiSuccess(updated);
}

export async function allocateSalesOrder(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "allocate");

  const input = allocateSchema.parse(await request.json());

  const so = await prisma.salesOrder.findUnique({ where: { id }, include: { lines: true } });
  if (!so || so.companyId !== session.companyId) throw notFoundError();
  if (so.status !== "CONFIRMED") {
    throw businessRuleError("Chỉ có thể giữ hàng cho đơn hàng đã Xác nhận", {
      rule: "SO_NOT_CONFIRMED",
      currentStatus: so.status,
    });
  }

  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) {
    throw validationError("Kho không hợp lệ");
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of so.lines) {
      const remaining = line.qty - line.qtyReserved;
      if (remaining <= 0) continue;

      await reserveStock(tx, { warehouseId: input.warehouseId, productId: line.productId, qty: remaining });
      await tx.stockReservation.create({
        data: { soLineId: line.id, warehouseId: input.warehouseId, productId: line.productId, qty: remaining },
      });
      await tx.salesOrderLine.update({ where: { id: line.id }, data: { qtyReserved: line.qty } });
    }

    return tx.salesOrder.update({ where: { id }, data: { status: "ALLOCATED" }, include });
  });

  return apiSuccess(updated);
}

export async function cancelSalesOrder(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-order", "cancel");

  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { lines: { include: { reservations: true } } },
  });
  if (!so || so.companyId !== session.companyId) throw notFoundError();
  if (!["DRAFT", "PENDING_APPROVAL", "CONFIRMED", "ALLOCATED"].includes(so.status)) {
    throw businessRuleError("Không thể hủy đơn hàng ở trạng thái hiện tại", {
      rule: "SO_NOT_CANCELLABLE",
      currentStatus: so.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (so.status === "ALLOCATED") {
      for (const line of so.lines) {
        for (const reservation of line.reservations) {
          await releaseReservation(tx, {
            warehouseId: reservation.warehouseId,
            productId: reservation.productId,
            qty: reservation.qty,
          });
        }
        await tx.stockReservation.deleteMany({ where: { soLineId: line.id } });
        await tx.salesOrderLine.update({ where: { id: line.id }, data: { qtyReserved: 0 } });
      }
    }
    return tx.salesOrder.update({ where: { id }, data: { status: "CANCELLED" }, include });
  });

  return apiSuccess(updated);
}
