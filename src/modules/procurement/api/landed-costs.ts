import { z } from "zod";
import { LandedCostType, AllocationMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";

const createSchema = z.object({
  shipmentId: z.string().min(1),
  costType: z.nativeEnum(LandedCostType),
  amount: z.number().int().nonnegative(),
  currency: z.string().optional(),
  allocationMethod: z.nativeEnum(AllocationMethod).optional(),
});

export async function listLandedCosts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "landed-cost", "read");

  const url = new URL(request.url);
  const shipmentId = url.searchParams.get("shipmentId");
  if (!shipmentId) throw validationError("Thiếu tham số shipmentId");

  const items = await prisma.landedCost.findMany({
    where: { shipmentId, companyId: session.companyId },
    include: { allocations: true },
    orderBy: { createdAt: "asc" },
  });
  return apiSuccess(items);
}

export async function createLandedCost(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "landed-cost", "create");

  const input = createSchema.parse(await request.json());
  const shipment = await prisma.importShipment.findUnique({ where: { id: input.shipmentId } });
  if (!shipment || shipment.companyId !== session.companyId) {
    throw validationError("Lô hàng không hợp lệ");
  }

  const created = await prisma.landedCost.create({
    data: {
      companyId: session.companyId,
      shipmentId: input.shipmentId,
      costType: input.costType,
      amount: input.amount,
      currency: input.currency ?? "VND",
      allocationMethod: input.allocationMethod ?? "BY_VALUE",
    },
  });
  return apiSuccess(created, undefined, 201);
}

/**
 * Phân bổ tất cả LandedCost của 1 lô hàng vào các dòng PO tương ứng — tính
 * lại giá vốn thực tế/SKU (docs/data-model.md mục 7). Chỉ hỗ trợ BY_VALUE và
 * BY_QTY ở Phase 2 (BY_WEIGHT/BY_VOLUME cần dữ liệu trọng lượng/thể tích sản
 * phẩm — chưa có trong schema, để lại phase sau nếu cần).
 */
export async function allocateLandedCosts(shipmentId: string) {
  const session = await getCurrentSession();
  requirePermission(session, "landed-cost", "update");

  const shipment = await prisma.importShipment.findUnique({
    where: { id: shipmentId },
    include: { purchaseOrder: { include: { lines: true } }, landedCosts: true },
  });
  if (!shipment || shipment.companyId !== session.companyId) throw notFoundError("Không tìm thấy lô hàng");
  if (shipment.landedCosts.length === 0) {
    throw businessRuleError("Chưa có chi phí nào được ghi nhận cho lô hàng này", { rule: "NO_LANDED_COST" });
  }

  const lines = shipment.purchaseOrder.lines;
  if (lines.length === 0) {
    throw businessRuleError("Đơn mua hàng của lô hàng này không có dòng hàng nào", { rule: "PO_HAS_NO_LINES" });
  }

  const unsupported = shipment.landedCosts.find(
    (lc) => lc.allocationMethod === "BY_WEIGHT" || lc.allocationMethod === "BY_VOLUME"
  );
  if (unsupported) {
    throw businessRuleError(
      "Phương pháp phân bổ theo trọng lượng/thể tích chưa được hỗ trợ ở Phase 2",
      { rule: "ALLOCATION_METHOD_NOT_SUPPORTED", costType: unsupported.costType }
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const landedCost of shipment.landedCosts) {
      await tx.landedCostAllocation.deleteMany({ where: { landedCostId: landedCost.id } });

      const weights = lines.map((l) => (landedCost.allocationMethod === "BY_QTY" ? l.qty : l.totalAmount));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      if (totalWeight <= 0) continue;

      let allocatedSoFar = 0;
      for (let i = 0; i < lines.length; i++) {
        const isLast = i === lines.length - 1;
        const share = isLast
          ? landedCost.amount - allocatedSoFar
          : Math.round((weights[i] / totalWeight) * landedCost.amount);
        allocatedSoFar += share;

        await tx.landedCostAllocation.create({
          data: { landedCostId: landedCost.id, poLineId: lines[i].id, allocatedAmount: share },
        });
      }
    }
  });

  const result = await prisma.landedCost.findMany({
    where: { shipmentId },
    include: { allocations: { include: { poLine: { include: { product: true } } } } },
  });
  return apiSuccess(result);
}
