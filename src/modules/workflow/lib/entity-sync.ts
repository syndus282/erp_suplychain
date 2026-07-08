import { prisma } from "@/lib/prisma";

/**
 * Đồng bộ trạng thái entity nguồn sau khi ApprovalRequest được quyết định.
 * Cách làm tạm thời (switch cứng theo entityType) cho Phase 1-2 vì mới chỉ có
 * 1-2 entity tích hợp workflow — khi số lượng tăng lên nhiều ở các phase sau,
 * cân nhắc refactor sang cơ chế đăng ký handler động. Đây KHÔNG phải import
 * chéo module (chỉ gọi thẳng Prisma model), nên không phát sinh circular
 * dependency giữa module workflow và procurement.
 */
export async function syncEntityAfterDecision(
  entityType: string,
  entityId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<void> {
  switch (entityType) {
    case "PurchaseRequest":
      await prisma.purchaseRequest.update({ where: { id: entityId }, data: { status: decision } });
      break;
    case "PurchaseOrder":
      // PurchaseOrderStatus có literal APPROVED trùng tên nhưng không có
      // REJECTED, nên khi từ chối phải map sang Cancelled.
      await prisma.purchaseOrder.update({
        where: { id: entityId },
        data: { status: decision === "APPROVED" ? "APPROVED" : "CANCELLED" },
      });
      break;
    case "SalesOrder":
      // SalesOrderStatus không có literal APPROVED/REJECTED (khác PurchaseRequestStatus)
      // nên phải map: duyệt -> Confirmed (đơn hàng chính thức có hiệu lực),
      // từ chối -> Cancelled (chiết khấu vượt mức không được chấp nhận).
      await prisma.salesOrder.update({
        where: { id: entityId },
        data: { status: decision === "APPROVED" ? "CONFIRMED" : "CANCELLED", confirmedAt: decision === "APPROVED" ? new Date() : undefined },
      });
      break;
    default:
      break;
  }
}
