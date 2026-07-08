import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";

/** Danh sách Role, chỉ dùng để chọn approverRoleId khi cấu hình Approval Matrix — chưa có màn hình tạo/sửa Role ở phạm vi Phase 10. */
export async function listRoles() {
  const session = await getCurrentSession();
  requirePermission(session, "role", "read");

  const roles = await prisma.role.findMany({
    where: { companyId: session.companyId },
    orderBy: { code: "asc" },
  });

  return apiSuccess(roles);
}
