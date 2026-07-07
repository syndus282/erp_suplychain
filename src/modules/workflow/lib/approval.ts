import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { businessRuleError, forbiddenError, notFoundError } from "@/lib/api/errors";
import { syncEntityAfterDecision } from "./entity-sync";

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

/**
 * Khung Workflow tối giản Phase 1 (theo docs/ROADMAP.md Phase 1): request → 1
 * người duyệt, CHƯA có escalation/notification/nhiều bước — việc đó thuộc
 * Phase 10 (docs/business-spec/12-workflow-approval.md).
 *
 * Dùng entityType/entityId (không FK cứng) để bất kỳ module nào (PurchaseOrder
 * ở Phase 2, StockAdjustment ở Phase 3...) cũng gắn được vào đây mà không phải
 * sửa bảng Workflow — xem docs/data-model.md mục 16.
 */

export async function createApprovalRequest(
  params: {
    companyId: string;
    entityType: string;
    entityId: string;
    requestedById: string;
    approverUserId: string;
  },
  client: PrismaClientOrTx = prisma
) {
  return client.approvalRequest.create({
    data: {
      companyId: params.companyId,
      entityType: params.entityType,
      entityId: params.entityId,
      requestedById: params.requestedById,
      status: "PENDING",
      currentStep: 1,
      steps: {
        create: [{ stepOrder: 1, approverUserId: params.approverUserId, status: "PENDING" }],
      },
    },
    include: { steps: true },
  });
}

export async function decideApprovalStep(params: {
  approvalRequestId: string;
  actorUserId: string;
  decision: "APPROVED" | "REJECTED";
  comment?: string;
}) {
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: params.approvalRequestId },
    include: { steps: true },
  });
  if (!approvalRequest) throw notFoundError("Không tìm thấy yêu cầu duyệt");
  if (approvalRequest.status !== "PENDING") {
    throw businessRuleError("Yêu cầu này đã được xử lý, không thể duyệt lại", {
      rule: "APPROVAL_ALREADY_DECIDED",
    });
  }

  const step = approvalRequest.steps.find((s) => s.stepOrder === approvalRequest.currentStep);
  if (!step || step.status !== "PENDING") {
    throw businessRuleError("Không có bước duyệt đang chờ xử lý", { rule: "NO_PENDING_STEP" });
  }
  if (step.approverUserId !== params.actorUserId) {
    throw forbiddenError("Bạn không phải người được phân công duyệt yêu cầu này");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.approvalStep.update({
      where: { id: step.id },
      data: { status: params.decision, actedAt: new Date(), comment: params.comment },
    });
    return tx.approvalRequest.update({
      where: { id: approvalRequest.id },
      data: { status: params.decision },
      include: { steps: true },
    });
  });

  await syncEntityAfterDecision(updated.entityType, updated.entityId, params.decision);
  return updated;
}
