import type { Prisma, PrismaClient, StockMovementType } from "@prisma/client";
import { businessRuleError } from "@/lib/api/errors";

type Tx = PrismaClient | Prisma.TransactionClient;

export interface StockMovementInput {
  companyId: string;
  warehouseId: string;
  productId: string;
  lotId?: string | null;
  type: StockMovementType;
  /** Dương = tăng tồn (RECEIPT, TRANSFER_IN, ADJUSTMENT tăng), âm = giảm tồn (ISSUE, TRANSFER_OUT...). */
  qty: number;
  serialId?: string | null;
  refType?: string;
  refId?: string;
}

/**
 * Điểm ghi nhận DUY NHẤT cho mọi biến động tồn kho — tạo dòng `StockMovement`
 * (sổ cái) rồi cập nhật `InventoryBalance` (cache tổng hợp) trong cùng 1 lần
 * gọi. Mọi module khác (Procurement, Sales, Distribution...) PHẢI đi qua hàm
 * này khi cần thay đổi tồn kho — không tự ý update InventoryBalance trực
 * tiếp ở nơi khác, tránh 2 nguồn sự thật (xem docs/data-model.md mục 16.2).
 *
 * Bắt buộc gọi trong 1 `prisma.$transaction` cùng với thao tác nghiệp vụ liên
 * quan (vd. tạo GoodsReceiptLine) để đảm bảo tính toàn vẹn.
 */
export async function recordStockMovement(tx: Tx, input: StockMovementInput): Promise<void> {
  await tx.stockMovement.create({
    data: {
      companyId: input.companyId,
      warehouseId: input.warehouseId,
      productId: input.productId,
      lotId: input.lotId ?? null,
      serialId: input.serialId ?? null,
      type: input.type,
      qty: input.qty,
      refType: input.refType,
      refId: input.refId,
    },
  });

  const existing = await tx.inventoryBalance.findFirst({
    where: { warehouseId: input.warehouseId, productId: input.productId, lotId: input.lotId ?? null },
  });

  if (existing) {
    const newOnHand = existing.onHandQty + input.qty;
    if (newOnHand < 0) {
      throw businessRuleError("Không đủ tồn kho khả dụng để thực hiện thao tác này", {
        rule: "NEGATIVE_STOCK",
        warehouseId: input.warehouseId,
        productId: input.productId,
        currentOnHand: existing.onHandQty,
        requestedChange: input.qty,
      });
    }
    await tx.inventoryBalance.update({
      where: { id: existing.id },
      data: { onHandQty: newOnHand, availableQty: newOnHand - existing.reservedQty },
    });
  } else {
    if (input.qty < 0) {
      throw businessRuleError("Không đủ tồn kho khả dụng để thực hiện thao tác này", {
        rule: "NEGATIVE_STOCK",
        warehouseId: input.warehouseId,
        productId: input.productId,
        currentOnHand: 0,
        requestedChange: input.qty,
      });
    }
    await tx.inventoryBalance.create({
      data: {
        companyId: input.companyId,
        warehouseId: input.warehouseId,
        productId: input.productId,
        lotId: input.lotId ?? null,
        onHandQty: input.qty,
        reservedQty: 0,
        availableQty: input.qty,
        inTransitQty: 0,
        consignmentQty: 0,
        warrantyQty: 0,
      },
    });
  }
}

/**
 * Giữ hàng (Sales Order allocation) — chỉ chuyển 1 phần `availableQty` sang
 * `reservedQty`, KHÔNG đụng `onHandQty` (hàng vẫn nằm vật lý trong kho, chỉ
 * không còn "khả dụng" cho đơn khác). Xuất kho thật (ISSUE) diễn ra ở bước
 * giao hàng (Phase 6), lúc đó mới gọi `recordStockMovement` + giải phóng phần
 * đã giữ tương ứng.
 */
export async function reserveStock(
  tx: Tx,
  params: { warehouseId: string; productId: string; lotId?: string | null; qty: number }
): Promise<void> {
  const existing = await tx.inventoryBalance.findFirst({
    where: { warehouseId: params.warehouseId, productId: params.productId, lotId: params.lotId ?? null },
  });

  if (!existing || existing.availableQty < params.qty) {
    throw businessRuleError("Không đủ tồn kho khả dụng để giữ hàng cho đơn này", {
      rule: "INSUFFICIENT_AVAILABLE_STOCK",
      warehouseId: params.warehouseId,
      productId: params.productId,
      available: existing?.availableQty ?? 0,
      requested: params.qty,
    });
  }

  await tx.inventoryBalance.update({
    where: { id: existing.id },
    data: { reservedQty: existing.reservedQty + params.qty, availableQty: existing.availableQty - params.qty },
  });
}

/** Giải phóng hàng đã giữ (hủy đơn/hủy giữ hàng) — ngược lại với `reserveStock`. */
export async function releaseReservation(
  tx: Tx,
  params: { warehouseId: string; productId: string; lotId?: string | null; qty: number }
): Promise<void> {
  const existing = await tx.inventoryBalance.findFirst({
    where: { warehouseId: params.warehouseId, productId: params.productId, lotId: params.lotId ?? null },
  });
  if (!existing) return;

  const releasedQty = Math.min(params.qty, existing.reservedQty);
  await tx.inventoryBalance.update({
    where: { id: existing.id },
    data: { reservedQty: existing.reservedQty - releasedQty, availableQty: existing.availableQty + releasedQty },
  });
}
