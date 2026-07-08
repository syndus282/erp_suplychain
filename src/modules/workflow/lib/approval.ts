import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { businessRuleError, forbiddenError, notFoundError } from "@/lib/api/errors";
import { syncEntityAfterDecision } from "./entity-sync";
import { notifyUser, notifyRole } from "./notify";
import { writeAuditLog } from "./audit";

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

/**
 * Khung Workflow (Phase 10 - docs/business-spec/12-workflow-approval.md):
 * request -> 1 bước duyệt, người duyệt có thể là 1 user cụ thể HOẶC bất kỳ ai
 * giữ 1 role (approverRoleId, dùng khi nghiệp vụ tra ra role từ ApprovalMatrix
 * chứ chưa biết trước user cụ thể nào). Dùng entityType/entityId (không FK
 * cứng) để bất kỳ module nào cũng gắn được vào đây — xem docs/data-model.md
 * mục 16.
 */

export async function createApprovalRequest(
  params: {
    companyId: string;
    entityType: string;
    entityId: string;
    requestedById: string;
    approverUserId?: string;
    approverRoleId?: string;
    notificationTitle?: string;
  },
  client: PrismaClientOrTx = prisma
) {
  if (!params.approverUserId && !params.approverRoleId) {
    throw businessRuleError("Yêu cầu duyệt phải có người duyệt hoặc vai trò duyệt", {
      rule: "APPROVER_REQUIRED",
    });
  }

  const created = await client.approvalRequest.create({
    data: {
      companyId: params.companyId,
      entityType: params.entityType,
      entityId: params.entityId,
      requestedById: params.requestedById,
      status: "PENDING",
      currentStep: 1,
      steps: {
        create: [
          {
            stepOrder: 1,
            approverUserId: params.approverUserId,
            approverRoleId: params.approverRoleId,
            status: "PENDING",
          },
        ],
      },
    },
    include: { steps: true },
  });

  const title = params.notificationTitle ?? `Yêu cầu duyệt: ${params.entityType}`;
  if (params.approverUserId) {
    await notifyUser(
      { companyId: params.companyId, userId: params.approverUserId, type: "APPROVAL_REQUEST", title },
      client
    );
  } else if (params.approverRoleId) {
    await notifyRole(
      { companyId: params.companyId, roleId: params.approverRoleId, type: "APPROVAL_REQUEST", title },
      client
    );
  }

  return created;
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

  // Segregation of Duties (docs/business-spec/12 mục 31-32): người tạo yêu
  // cầu không được tự duyệt yêu cầu của chính mình.
  if (approvalRequest.requestedById === params.actorUserId) {
    throw forbiddenError("Người tạo yêu cầu không được tự duyệt yêu cầu của chính mình");
  }

  const step = approvalRequest.steps.find((s) => s.stepOrder === approvalRequest.currentStep);
  if (!step || step.status !== "PENDING") {
    throw businessRuleError("Không có bước duyệt đang chờ xử lý", { rule: "NO_PENDING_STEP" });
  }

  if (step.approverUserId) {
    if (step.approverUserId !== params.actorUserId) {
      throw forbiddenError("Bạn không phải người được phân công duyệt yêu cầu này");
    }
  } else if (step.approverRoleId) {
    const hasRole = await prisma.userRole.findFirst({
      where: { userId: params.actorUserId, roleId: step.approverRoleId },
    });
    if (!hasRole) {
      throw forbiddenError("Bạn không thuộc vai trò được phân công duyệt yêu cầu này");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.approvalStep.update({
      where: { id: step.id },
      data: { status: params.decision, actedAt: new Date(), comment: params.comment },
    });
    const result = await tx.approvalRequest.update({
      where: { id: approvalRequest.id },
      data: { status: params.decision },
      include: { steps: true },
    });
    await writeAuditLog(
      {
        companyId: approvalRequest.companyId,
        entityType: approvalRequest.entityType,
        entityId: approvalRequest.entityId,
        action: params.decision === "APPROVED" ? "APPROVE" : "REJECT",
        changedById: params.actorUserId,
        oldValue: { status: "PENDING" },
        newValue: { status: params.decision, comment: params.comment },
      },
      tx
    );
    return result;
  });

  await notifyUser({
    companyId: approvalRequest.companyId,
    userId: approvalRequest.requestedById,
    type: params.decision === "APPROVED" ? "APPROVAL_APPROVED" : "APPROVAL_REJECTED",
    title: `Yêu cầu duyệt ${approvalRequest.entityType} đã được ${params.decision === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"}`,
    message: params.comment,
  });

  await syncEntityAfterDecision(updated.entityType, updated.entityId, params.decision);
  return updated;
}
