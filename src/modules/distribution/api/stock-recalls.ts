import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

const lineSchema = z.object({ productId: z.string().min(1), qty: z.number().positive() });

const createSchema = z.object({
  dealerId: z.string().min(1, "Phải chọn đại lý"),
  reason: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const receiveSchema = z.object({ warehouseId: z.string().min(1, "Phải chọn kho nhận hàng thu hồi") });

const include = { dealer: true, lines: { include: { product: true } } };

export async function listStockRecalls(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-recall", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "requestedAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.stockRecall.findMany({ where, orderBy, skip, take, include }),
    prisma.stockRecall.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createStockRecall(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-recall", "create");

  const input = createSchema.parse(await request.json());
  const dealer = await prisma.customer.findUnique({ where: { id: input.dealerId } });
  if (!dealer || dealer.companyId !== session.companyId || dealer.type !== "DEALER") {
    throw validationError("Đại lý không hợp lệ");
  }

  for (const line of input.lines) {
    const balance = await prisma.consignmentBalance.findFirst({
      where: { dealerId: input.dealerId, productId: line.productId, serialId: null },
    });
    if (!balance || balance.qtyOnHand < line.qty) {
      throw businessRuleError(
        `Đại lý chỉ còn ${balance?.qtyOnHand ?? 0} sản phẩm ký gửi, không đủ để thu hồi ${line.qty}`,
        { rule: "CONSIGNMENT_QTY_EXCEEDED", available: balance?.qtyOnHand ?? 0 }
      );
    }
  }

  const created = await prisma.stockRecall.create({
    data: {
      companyId: session.companyId,
      dealerId: input.dealerId,
      code: generateCode("RCL"),
      reason: input.reason,
      status: "REQUESTED",
      lines: { create: input.lines },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function receiveStockRecall(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-recall", "receive");

  const recall = await prisma.stockRecall.findUnique({ where: { id }, include: { lines: true } });
  if (!recall || recall.companyId !== session.companyId) throw notFoundError();
  if (recall.status === "CLOSED") {
    throw businessRuleError("Phiếu thu hồi này đã hoàn tất", { rule: "STOCK_RECALL_ALREADY_CLOSED" });
  }

  const input = receiveSchema.parse(await request.json());
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho nhận không hợp lệ");

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of recall.lines) {
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: input.warehouseId,
        productId: line.productId,
        type: "CONSIGNMENT_RETURN",
        qty: line.qty,
        refType: "StockRecall",
        refId: recall.id,
      });

      const balance = await tx.consignmentBalance.findFirst({
        where: { dealerId: recall.dealerId, productId: line.productId, serialId: null },
      });
      if (balance) {
        await tx.consignmentBalance.update({
          where: { id: balance.id },
          data: { qtyOnHand: balance.qtyOnHand - line.qty, qtyReturned: balance.qtyReturned + line.qty },
        });
      }
    }

    return tx.stockRecall.update({
      where: { id },
      data: { status: "CLOSED", completedAt: new Date() },
      include,
    });
  });

  return apiSuccess(updated);
}
