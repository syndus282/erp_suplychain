import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { decideApprovalStep } from "../lib/approval";

export async function listApprovalRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "approval-request", "read");

  const url = new URL(request.url);
  const assignedToMe = url.searchParams.get("assignedToMe") !== "false"; // mặc định chỉ xem việc của mình

  const items = await prisma.approvalRequest.findMany({
    where: {
      companyId: session.companyId,
      ...(assignedToMe
        ? { steps: { some: { approverUserId: session.sub, status: "PENDING" } } }
        : {}),
    },
    include: { steps: true },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(items);
}

const decideSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().optional(),
});

export async function decideApprovalRequest(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "approval-request", "update");

  const input = decideSchema.parse(await request.json());
  const result = await decideApprovalStep({
    approvalRequestId: id,
    actorUserId: session.sub,
    decision: input.decision,
    comment: input.comment,
  });

  return apiSuccess(result);
}
