import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notifyUser, notifyRole } from "../lib/notify";

const ESCALATION_THRESHOLD_HOURS = 24;

/**
 * Escalation on-demand (docs/business-spec/12 mục 28: ladder 24h/48h/72h).
 * App Next.js này KHÔNG có hạ tầng cron/background job riêng, nên escalation
 * không tự chạy theo giờ — phải gọi thủ công hoặc từ 1 scheduler bên ngoài
 * (vd. cron hệ điều hành gọi endpoint này định kỳ). Đơn giản hóa: chỉ 1 mốc
 * 24h (chưa phân biệt 24h/48h/72h thành hành động khác nhau như đổi người
 * duyệt) — mỗi lần gọi sẽ nhắc lại toàn bộ step PENDING quá hạn, không lưu
 * vết đã nhắc lần nào (chấp nhận gọi lại nhiều lần sẽ nhắc lại nhiều lần).
 */
export async function runEscalation() {
  const session = await getCurrentSession();
  requirePermission(session, "approval-request", "update");

  const threshold = new Date(Date.now() - ESCALATION_THRESHOLD_HOURS * 60 * 60 * 1000);

  const overdueRequests = await prisma.approvalRequest.findMany({
    where: { companyId: session.companyId, status: "PENDING", createdAt: { lt: threshold } },
    include: { steps: true },
  });

  let escalatedCount = 0;
  for (const req of overdueRequests) {
    const step = req.steps.find((s) => s.stepOrder === req.currentStep && s.status === "PENDING");
    if (!step) continue;

    const title = `[Nhắc duyệt quá hạn] Yêu cầu duyệt ${req.entityType} đã chờ hơn ${ESCALATION_THRESHOLD_HOURS}h`;
    if (step.approverUserId) {
      await notifyUser({ companyId: session.companyId, userId: step.approverUserId, type: "ESCALATION", title });
    } else if (step.approverRoleId) {
      await notifyRole({ companyId: session.companyId, roleId: step.approverRoleId, type: "ESCALATION", title });
    }
    escalatedCount++;
  }

  return apiSuccess({ escalatedCount });
}
