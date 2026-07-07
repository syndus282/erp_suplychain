import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "../lib/stock-ledger";

const createSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho"),
  productIds: z.array(z.string().min(1)).min(1, "Phải chọn ít nhất 1 sản phẩm để kiểm kê"),
});

const submitSchema = z.object({
  lines: z.array(z.object({ lineId: z.string().min(1), actualQty: z.number().nonnegative() })),
});

const include = { warehouse: true, lines: { include: { product: true } } };

export async function listStockCounts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-count", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.stockCount.findMany({ where, orderBy, skip, take, include }),
    prisma.stockCount.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createStockCount(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-count", "create");

  const input = createSchema.parse(await request.json());
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho không hợp lệ");

  const balances = await prisma.inventoryBalance.findMany({
    where: { warehouseId: input.warehouseId, productId: { in: input.productIds } },
  });
  const systemQtyByProduct = new Map<string, number>();
  for (const b of balances) {
    systemQtyByProduct.set(b.productId, (systemQtyByProduct.get(b.productId) ?? 0) + b.onHandQty);
  }

  const created = await prisma.stockCount.create({
    data: {
      companyId: session.companyId,
      warehouseId: input.warehouseId,
      code: `SC-${Date.now().toString(36).toUpperCase()}`,
      status: "DRAFT",
      lines: {
        create: input.productIds.map((productId) => {
          const systemQty = systemQtyByProduct.get(productId) ?? 0;
          return { productId, systemQty, actualQty: systemQty, varianceQty: 0 };
        }),
      },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function submitStockCount(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-count", "submit");

  const stockCount = await prisma.stockCount.findUnique({ where: { id }, include: { lines: true } });
  if (!stockCount || stockCount.companyId !== session.companyId) throw notFoundError();
  if (stockCount.status !== "DRAFT") {
    throw businessRuleError("Chỉ có thể ghi nhận số liệu kiểm kê khi phiếu đang ở trạng thái Nháp", {
      rule: "STOCK_COUNT_NOT_DRAFT",
      currentStatus: stockCount.status,
    });
  }

  const input = submitSchema.parse(await request.json());

  const updated = await prisma.$transaction(async (tx) => {
    for (const entry of input.lines) {
      const line = stockCount.lines.find((l) => l.id === entry.lineId);
      if (!line) continue;
      await tx.stockCountLine.update({
        where: { id: entry.lineId },
        data: { actualQty: entry.actualQty, varianceQty: entry.actualQty - line.systemQty },
      });
    }
    return tx.stockCount.update({
      where: { id },
      data: { status: "SUBMITTED", countedAt: new Date() },
      include,
    });
  });

  return apiSuccess(updated);
}

export async function approveStockCount(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-count", "approve");

  const stockCount = await prisma.stockCount.findUnique({ where: { id }, include: { lines: true } });
  if (!stockCount || stockCount.companyId !== session.companyId) throw notFoundError();
  if (stockCount.status !== "SUBMITTED") {
    throw businessRuleError("Chỉ có thể duyệt phiếu kiểm kê đã ghi nhận số liệu (SUBMITTED)", {
      rule: "STOCK_COUNT_NOT_SUBMITTED",
      currentStatus: stockCount.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of stockCount.lines) {
      if (line.varianceQty !== 0) {
        await recordStockMovement(tx, {
          companyId: session.companyId,
          warehouseId: stockCount.warehouseId,
          productId: line.productId,
          type: "ADJUSTMENT",
          qty: line.varianceQty,
          refType: "StockCount",
          refId: stockCount.id,
        });
      }
    }
    return tx.stockCount.update({ where: { id }, data: { status: "CLOSED" }, include });
  });

  return apiSuccess(updated);
}
