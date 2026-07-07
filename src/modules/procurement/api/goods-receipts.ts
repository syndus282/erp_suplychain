import { z } from "zod";
import { QcResult, DiscrepancyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { generateCode } from "../lib/codegen";

// PO đang ở các trạng thái này mới được phép nhận hàng (theo docs/business-spec/02
// mục "Không cho nhập kho nếu không có PO hợp lệ").
const RECEIVABLE_PO_STATUSES = ["APPROVED", "SENT_SUPPLIER", "CONFIRMED", "SHIPPING", "PARTIALLY_RECEIVED"];

const lineSchema = z.object({
  poLineId: z.string().min(1),
  productId: z.string().min(1),
  qtyReceived: z.number().positive("Số lượng nhận phải lớn hơn 0"),
  qcResult: z.nativeEnum(QcResult).optional(),
});

const discrepancySchema = z.object({
  productId: z.string().min(1),
  type: z.nativeEnum(DiscrepancyType),
  qty: z.number(),
  note: z.string().optional(),
});

const createSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho nhận"),
  poId: z.string().min(1, "Phải chọn đơn mua hàng"),
  shipmentId: z.string().nullable().optional(),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng nhận hàng"),
  discrepancies: z.array(discrepancySchema).optional(),
});

const include = {
  warehouse: true,
  po: true,
  shipment: true,
  lines: { include: { product: true } },
  discrepancies: true,
};

export async function listGoodsReceipts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "goods-receipt", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.goodsReceipt.findMany({ where, orderBy, skip, take, include }),
    prisma.goodsReceipt.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createGoodsReceipt(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "goods-receipt", "create");

  const input = createSchema.parse(await request.json());

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: input.poId },
    include: { lines: true },
  });
  if (!po || po.companyId !== session.companyId) throw notFoundError("Không tìm thấy đơn mua hàng");
  if (!RECEIVABLE_PO_STATUSES.includes(po.status)) {
    throw businessRuleError("Đơn mua hàng chưa được duyệt hoặc đã đóng, không thể nhận hàng", {
      rule: "PO_NOT_RECEIVABLE",
      currentStatus: po.status,
    });
  }

  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) {
    throw businessRuleError("Kho nhận không hợp lệ", { rule: "WAREHOUSE_INVALID" });
  }

  for (const line of input.lines) {
    const poLine = po.lines.find((l) => l.id === line.poLineId);
    if (!poLine) {
      throw businessRuleError("Dòng hàng không thuộc đơn mua hàng đã chọn", { rule: "PO_LINE_MISMATCH" });
    }
    if (line.qtyReceived > poLine.qtyRemaining) {
      throw businessRuleError(
        `Số lượng nhận (${line.qtyReceived}) vượt quá số lượng còn lại của đơn hàng (${poLine.qtyRemaining})`,
        { rule: "OVER_RECEIPT", poLineId: line.poLineId, qtyRemaining: poLine.qtyRemaining }
      );
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const receipt = await tx.goodsReceipt.create({
      data: {
        companyId: session.companyId,
        code: generateCode("GR"),
        warehouseId: input.warehouseId,
        poId: input.poId,
        shipmentId: input.shipmentId,
        receivedById: session.employeeId,
        status: "COMPLETED",
        lines: {
          create: input.lines.map((line) => {
            const poLine = po.lines.find((l) => l.id === line.poLineId)!;
            return {
              poLineId: line.poLineId,
              productId: line.productId,
              serialId: null,
              lotId: null,
              qtyOrdered: poLine.qty,
              qtyReceived: line.qtyReceived,
              qcResult: line.qcResult ?? "PASS",
            };
          }),
        },
        discrepancies: input.discrepancies
          ? { create: input.discrepancies }
          : undefined,
      },
      include,
    });

    for (const line of input.lines) {
      const poLine = po.lines.find((l) => l.id === line.poLineId)!;
      await tx.purchaseOrderLine.update({
        where: { id: poLine.id },
        data: {
          qtyReceived: poLine.qtyReceived + line.qtyReceived,
          qtyRemaining: poLine.qtyRemaining - line.qtyReceived,
        },
      });
    }

    const updatedLines = await tx.purchaseOrderLine.findMany({ where: { poId: po.id } });
    const allClosed = updatedLines.every((l) => l.qtyRemaining <= 0);
    await tx.purchaseOrder.update({
      where: { id: po.id },
      data: { status: allClosed ? "CLOSED" : "PARTIALLY_RECEIVED" },
    });

    return receipt;
  });

  return apiSuccess(created, undefined, 201);
}
