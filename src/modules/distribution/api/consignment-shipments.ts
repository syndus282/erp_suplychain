import { z } from "zod";
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
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  unitCost: z.number().int().nonnegative(),
});

const createSchema = z.object({
  dealerId: z.string().min(1, "Phải chọn đại lý"),
  fromWarehouseId: z.string().min(1, "Phải chọn kho xuất"),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const include = {
  dealer: true,
  fromWarehouse: true,
  lines: { include: { product: true } },
};

export async function listConsignmentShipments(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-shipment", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);
  const dealerId = url.searchParams.get("dealerId");

  const where = { companyId: session.companyId, ...(dealerId ? { dealerId } : {}) };
  const [items, totalItems] = await Promise.all([
    prisma.consignmentShipment.findMany({ where, orderBy, skip, take, include }),
    prisma.consignmentShipment.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createConsignmentShipment(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-shipment", "create");

  const input = createSchema.parse(await request.json());

  const dealer = await prisma.customer.findUnique({ where: { id: input.dealerId } });
  if (!dealer || dealer.companyId !== session.companyId || dealer.type !== "DEALER") {
    throw validationError("Đại lý không hợp lệ");
  }
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.fromWarehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho xuất không hợp lệ");

  const created = await prisma.consignmentShipment.create({
    data: {
      companyId: session.companyId,
      code: generateCode("CNS"),
      dealerId: input.dealerId,
      fromWarehouseId: input.fromWarehouseId,
      status: "REQUESTED",
      lines: { create: input.lines },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function deliverConsignmentShipment(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-shipment", "deliver");

  const shipment = await prisma.consignmentShipment.findUnique({ where: { id }, include: { lines: true } });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError();
  if (shipment.status !== "REQUESTED") {
    throw businessRuleError("Chỉ có thể giao hàng ký gửi đang ở trạng thái yêu cầu", {
      rule: "CONSIGNMENT_SHIPMENT_NOT_REQUESTED",
      currentStatus: shipment.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of shipment.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: shipment.fromWarehouseId,
        productId: line.productId,
        type: "CONSIGNMENT_OUT",
        qty: -line.qty,
        refType: "ConsignmentShipment",
        refId: shipment.id,
      });

      const existingBalance = await tx.consignmentBalance.findFirst({
        where: { dealerId: shipment.dealerId, productId: line.productId, serialId: null },
      });
      if (existingBalance) {
        await tx.consignmentBalance.update({
          where: { id: existingBalance.id },
          data: {
            qtyShipped: existingBalance.qtyShipped + line.qty,
            qtyOnHand: existingBalance.qtyOnHand + line.qty,
          },
        });
      } else {
        await tx.consignmentBalance.create({
          data: {
            companyId: session.companyId,
            dealerId: shipment.dealerId,
            productId: line.productId,
            qtyShipped: line.qty,
            qtyOnHand: line.qty,
          },
        });
      }
    }

    return tx.consignmentShipment.update({
      where: { id },
      data: { status: "DELIVERED", shippedAt: new Date(), receivedAt: new Date() },
      include,
    });
  });

  return apiSuccess(updated);
}
