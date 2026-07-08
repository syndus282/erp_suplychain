import { prisma } from "@/lib/prisma";
import { businessRuleError } from "@/lib/api/errors";

/**
 * Tra ApprovalMatrix (docs/business-spec/12 mục 6) để tìm role được phân công
 * duyệt 1 loại giao dịch theo số tiền (đã quy đổi VND). Ưu tiên hàng có
 * `minAmount` lớn nhất thỏa điều kiện (khớp mốc giá trị gần nhất). Nếu không
 * cấu hình rule nào cho transactionType này thì chặn cứng (không cho bỏ qua
 * duyệt) — công ty phải cấu hình ApprovalMatrix trước khi dùng workflow duyệt
 * cho loại giao dịch đó.
 */
export async function resolveApprover(
  companyId: string,
  transactionType: string,
  amountVnd: number
): Promise<{ approverRoleId: string }> {
  const candidates = await prisma.approvalMatrix.findMany({
    where: {
      companyId,
      transactionType,
      minAmount: { lte: amountVnd },
      OR: [{ maxAmount: null }, { maxAmount: { gte: amountVnd } }],
    },
    orderBy: { minAmount: "desc" },
    take: 1,
  });

  const matrix = candidates[0];
  if (!matrix) {
    throw businessRuleError(
      `Chưa cấu hình Approval Matrix cho loại giao dịch "${transactionType}" ở mức giá trị ${amountVnd.toLocaleString("vi-VN")} VND`,
      { rule: "NO_APPROVAL_MATRIX_RULE", transactionType, amountVnd }
    );
  }

  return { approverRoleId: matrix.approverRoleId };
}
