import { z } from "zod";
import type { SalesReturnStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

const lineSchema = z.object({
  productId: z.string().min(1),
  serialId: z.string().nullable().optional(),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  reason: z.string().optional(),
});

const createSchema = z.object({
  soId: z.string().min(1, "Phải chọn đơn hàng gốc"),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng trả"),
});

const receiveSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho nhận hàng trả"),
});

const include = {
  customer: true,
  salesOrder: { select: { id: true, code: true } },
  lines: { include: { product: true } },
};

export async function listSalesReturns(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "requestedAt"], { requestedAt: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.salesReturn.findMany({ where, orderBy, skip, take, include }),
    prisma.salesReturn.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createSalesReturn(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "create");

  const input = createSchema.parse(await request.json());

  const so = await prisma.salesOrder.findUnique({ where: { id: input.soId } });
  if (!so || so.companyId !== session.companyId) throw validationError("Đơn hàng không hợp lệ");
  if (so.status === "DRAFT" || so.status === "CANCELLED") {
    throw businessRuleError("Chỉ có thể tạo yêu cầu trả hàng cho đơn hàng đã xác nhận trở đi", {
      rule: "SO_NOT_ELIGIBLE_FOR_RETURN",
      currentStatus: so.status,
    });
  }

  const { lines, ...fields } = input;

  const created = await prisma.salesReturn.create({
    data: {
      ...fields,
      companyId: session.companyId,
      code: generateCode("SR"),
      customerId: so.customerId,
      status: "REQUESTED",
      lines: { create: lines.map((line) => ({ ...line, serialId: line.serialId ?? undefined })) },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

async function transitionReturn(
  id: string,
  companyId: string,
  from: SalesReturnStatus[],
  to: SalesReturnStatus,
  action: string
) {
  const salesReturn = await prisma.salesReturn.findUnique({ where: { id } });
  if (!salesReturn || salesReturn.companyId !== companyId) throw notFoundError();
  if (!from.includes(salesReturn.status)) {
    throw businessRuleError(`Không thể ${action} yêu cầu trả hàng ở trạng thái hiện tại`, {
      rule: "SALES_RETURN_INVALID_TRANSITION",
      currentStatus: salesReturn.status,
    });
  }
  return { salesReturn, next: to };
}

export async function approveSalesReturn(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "approve");
  const { next } = await transitionReturn(id, session.companyId, ["REQUESTED"], "APPROVED", "duyệt");
  const updated = await prisma.salesReturn.update({ where: { id }, data: { status: next }, include });
  return apiSuccess(updated);
}

export async function rejectSalesReturn(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "reject");
  const { next } = await transitionReturn(id, session.companyId, ["REQUESTED"], "REJECTED", "từ chối");
  const updated = await prisma.salesReturn.update({ where: { id }, data: { status: next }, include });
  return apiSuccess(updated);
}

export async function receiveSalesReturn(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "receive");

  const input = receiveSchema.parse(await request.json());
  const salesReturn = await prisma.salesReturn.findUnique({ where: { id }, include: { lines: true } });
  if (!salesReturn || salesReturn.companyId !== session.companyId) throw notFoundError();
  if (salesReturn.status !== "APPROVED") {
    throw businessRuleError("Chỉ có thể nhận hàng trả đã được duyệt", {
      rule: "SALES_RETURN_NOT_APPROVED",
      currentStatus: salesReturn.status,
    });
  }

  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho không hợp lệ");

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of salesReturn.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: input.warehouseId,
        productId: line.productId,
        serialId: line.serialId,
        type: "RECEIPT",
        qty: line.qty,
        refType: "SalesReturn",
        refId: salesReturn.id,
      });
    }
    return tx.salesReturn.update({ where: { id }, data: { status: "RECEIVED" }, include });
  });

  return apiSuccess(updated);
}

export async function qcSalesReturn(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "qc");
  const { next } = await transitionReturn(id, session.companyId, ["RECEIVED"], "QC_DONE", "kiểm tra chất lượng");
  const updated = await prisma.salesReturn.update({ where: { id }, data: { status: next }, include });
  return apiSuccess(updated);
}

export async function refundSalesReturn(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "sales-return", "refund");
  const { next } = await transitionReturn(id, session.companyId, ["QC_DONE"], "REFUNDED", "hoàn tiền/đổi hàng");
  const updated = await prisma.salesReturn.update({ where: { id }, data: { status: next }, include });
  return apiSuccess(updated);
}
