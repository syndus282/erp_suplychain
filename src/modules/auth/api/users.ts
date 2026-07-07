import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";

/** Danh sách User tối giản — chỉ dùng để chọn người duyệt (approver) trong các form workflow. */
export async function listUsers(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "user", "read");

  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  const users = await prisma.user.findMany({
    where: {
      companyId: session.companyId,
      status: "ACTIVE",
      ...(search ? { username: { contains: search } } : {}),
    },
    select: { id: true, username: true, email: true },
    take: 100,
    orderBy: { username: "asc" },
  });

  return apiSuccess(users);
}
