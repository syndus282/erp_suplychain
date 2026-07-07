import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "../lib/stock-ledger";

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  serialId: z.string().nullable().optional(),
  lotId: z.string().nullable().optional(),
});

const createSchema = z.object({
  fromWarehouseId: z.string().min(1, "Phải chọn kho xuất"),
  toWarehouseId: z.string().min(1, "Phải chọn kho nhận"),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const include = {
  fromWarehouse: true,
  toWarehouse: true,
  lines: { include: { product: true } },
};

export async function listStockTransfers(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-transfer", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.stockTransfer.findMany({ where, orderBy, skip, take, include }),
    prisma.stockTransfer.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createStockTransfer(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-transfer", "create");

  const input = createSchema.parse(await request.json());
  if (input.fromWarehouseId === input.toWarehouseId) {
    throw validationError("Kho xuất và kho nhận không được trùng nhau");
  }

  const warehouses = await prisma.warehouse.findMany({
    where: { id: { in: [input.fromWarehouseId, input.toWarehouseId] }, companyId: session.companyId },
  });
  if (warehouses.length !== 2) throw validationError("Kho xuất hoặc kho nhận không hợp lệ");

  const created = await prisma.stockTransfer.create({
    data: {
      companyId: session.companyId,
      code: `TRF-${Date.now().toString(36).toUpperCase()}`,
      fromWarehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      status: "PENDING_APPROVAL",
      lines: { create: input.lines.map((l) => ({ ...l, qtyReceived: 0 })) },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function shipStockTransfer(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-transfer", "ship");

  const transfer = await prisma.stockTransfer.findUnique({ where: { id }, include: { lines: true } });
  if (!transfer || transfer.companyId !== session.companyId) throw notFoundError();
  if (transfer.status !== "PENDING_APPROVAL") {
    throw businessRuleError("Chỉ có thể xuất kho phiếu điều chuyển đang chờ duyệt", {
      rule: "TRANSFER_NOT_PENDING",
      currentStatus: transfer.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of transfer.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: transfer.fromWarehouseId,
        productId: line.productId,
        lotId: line.lotId,
        type: "TRANSFER_OUT",
        qty: -line.qty,
        refType: "StockTransfer",
        refId: transfer.id,
      });
    }
    return tx.stockTransfer.update({
      where: { id },
      data: { status: "SHIPPING", shippedAt: new Date() },
      include,
    });
  });

  return apiSuccess(updated);
}

export async function receiveStockTransfer(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-transfer", "receive");

  const transfer = await prisma.stockTransfer.findUnique({ where: { id }, include: { lines: true } });
  if (!transfer || transfer.companyId !== session.companyId) throw notFoundError();
  if (transfer.status !== "SHIPPING") {
    throw businessRuleError("Phiếu điều chuyển chưa được xuất kho, không thể nhận hàng", {
      rule: "TRANSFER_NOT_SHIPPING",
      currentStatus: transfer.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of transfer.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: transfer.toWarehouseId!,
        productId: line.productId,
        lotId: line.lotId,
        type: "TRANSFER_IN",
        qty: line.qty,
        refType: "StockTransfer",
        refId: transfer.id,
      });
      await tx.stockTransferLine.update({ where: { id: line.id }, data: { qtyReceived: line.qty } });
    }
    return tx.stockTransfer.update({
      where: { id },
      data: { status: "COMPLETED", receivedAt: new Date() },
      include,
    });
  });

  return apiSuccess(updated);
}
