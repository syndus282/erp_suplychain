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

  // Từ Phase 10, step có thể phân công theo role (approverRoleId) thay vì
  // đích danh 1 user — phải tra thêm roleId của user hiện tại (session chỉ
  // có role CODE, không có role ID) để lọc "việc của mình" cho đúng, nếu
  // không sẽ ẩn mất các yêu cầu duyệt theo role.
  const myRoleIds = assignedToMe
    ? (
        await prisma.role.findMany({
          where: { companyId: session.companyId, code: { in: session.roles } },
          select: { id: true },
        })
      ).map((r) => r.id)
    : [];

  const items = await prisma.approvalRequest.findMany({
    where: {
      companyId: session.companyId,
      ...(assignedToMe
        ? {
            steps: {
              some: {
                status: "PENDING",
                OR: [{ approverUserId: session.sub }, { approverRoleId: { in: myRoleIds } }],
              },
            },
          }
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
