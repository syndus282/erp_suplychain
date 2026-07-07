import { z } from "zod";
import { QcResult, DiscrepancyType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "../lib/codegen";

// PO đang ở các trạng thái này mới được phép nhận hàng (theo docs/business-spec/02
// mục "Không cho nhập kho nếu không có PO hợp lệ").
const RECEIVABLE_PO_STATUSES = ["APPROVED", "SENT_SUPPLIER", "CONFIRMED", "SHIPPING", "PARTIALLY_RECEIVED"];

const lineSchema = z.object({
  poLineId: z.string().min(1),
  productId: z.string().min(1),
  qtyReceived: z.number().positive("Số lượng nhận phải lớn hơn 0"),
  qcResult: z.nativeEnum(QcResult).optional(),
  // Chỉ cần khi Product.manageSerial = true — 1 serial number/đơn vị nhận.
  serialNumbers: z.array(z.string().min(1)).optional(),
  // Chỉ cần khi Product.manageLot = true.
  lotNo: z.string().optional(),
  manufactureDate: z.string().optional(),
  expiryDate: z.string().optional(),
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

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((p) => [p.id, p]));

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

    const product = productById.get(line.productId);
    if (!product) throw validationError("Sản phẩm không hợp lệ");

    if (product.manageSerial) {
      if (!Number.isInteger(line.qtyReceived)) {
        throw validationError(`Sản phẩm ${product.code} quản lý theo serial nên số lượng phải là số nguyên`);
      }
      if (!line.serialNumbers || line.serialNumbers.length !== line.qtyReceived) {
        throw validationError(
          `Sản phẩm ${product.code} quản lý theo serial — cần nhập đủ ${line.qtyReceived} serial number`
        );
      }
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    // Tạo SerialNumber/LotBatch trước để có id gắn vào GoodsReceiptLine.
    const receiptLineData: Prisma.GoodsReceiptLineCreateWithoutReceiptInput[] = [];

    for (const line of input.lines) {
      const poLine = po.lines.find((l) => l.id === line.poLineId)!;
      const product = productById.get(line.productId)!;

      let lotId: string | null = null;
      if (product.manageLot && line.lotNo) {
        const lot = await tx.lotBatch.upsert({
          where: { companyId_productId_lotNo: { companyId: session.companyId, productId: line.productId, lotNo: line.lotNo } },
          update: {},
          create: {
            companyId: session.companyId,
            productId: line.productId,
            lotNo: line.lotNo,
            manufactureDate: line.manufactureDate ? new Date(line.manufactureDate) : undefined,
            expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined,
          },
        });
        lotId = lot.id;
      }

      if (product.manageSerial) {
        for (const serialNo of line.serialNumbers!) {
          const serial = await tx.serialNumber.create({
            data: {
              companyId: session.companyId,
              productId: line.productId,
              serialNo,
              warehouseId: input.warehouseId,
              lotId,
              status: "IN_STOCK",
            },
          });
          receiptLineData.push({
            poLine: { connect: { id: poLine.id } },
            product: { connect: { id: line.productId } },
            serial: { connect: { id: serial.id } },
            lot: lotId ? { connect: { id: lotId } } : undefined,
            qtyOrdered: poLine.qty,
            qtyReceived: 1,
            qcResult: line.qcResult ?? "PASS",
          });
        }
      } else {
        receiptLineData.push({
          poLine: { connect: { id: poLine.id } },
          product: { connect: { id: line.productId } },
          lot: lotId ? { connect: { id: lotId } } : undefined,
          qtyOrdered: poLine.qty,
          qtyReceived: line.qtyReceived,
          qcResult: line.qcResult ?? "PASS",
        });
      }
    }

    const receipt = await tx.goodsReceipt.create({
      data: {
        companyId: session.companyId,
        code: generateCode("GR"),
        warehouseId: input.warehouseId,
        poId: input.poId,
        shipmentId: input.shipmentId,
        receivedById: session.employeeId,
        status: "COMPLETED",
        lines: { create: receiptLineData },
        discrepancies: input.discrepancies ? { create: input.discrepancies } : undefined,
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

      const product = productById.get(line.productId)!;
      const lineWithLot = receiptLineData.find(
        (l) => l.product?.connect?.id === line.productId && l.poLine?.connect?.id === poLine.id
      );
      await recordStockMovement(tx, {
        companyId: session.companyId,
        warehouseId: input.warehouseId,
        productId: line.productId,
        lotId: product.manageLot ? (lineWithLot?.lot?.connect?.id ?? null) : null,
        type: "RECEIPT",
        qty: line.qtyReceived,
        refType: "GoodsReceipt",
        refId: receipt.id,
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
