import { prisma } from "@/lib/prisma";
import { forbiddenError, unauthenticatedError } from "@/lib/api/errors";
import type { SessionPayload } from "./session";

export function permissionCode(resource: string, action: string): string {
  return `${resource}:${action}`;
}

/** Nạp toàn bộ permission của user qua Role->RolePermission->Permission — gọi lúc đăng nhập để nhúng vào JWT. */
export async function loadUserPermissions(userId: string): Promise<{ roles: string[]; permissions: string[] }> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const userRole of userRoles) {
    roles.add(userRole.role.code);
    for (const rolePermission of userRole.role.permissions) {
      permissions.add(rolePermission.permission.code);
    }
  }

  return { roles: [...roles], permissions: [...permissions] };
}

/**
 * Kiểm tra quyền trong route handler. Ném ApiError phù hợp nếu không đủ điều
 * kiện — route handler chỉ cần gọi hàm này, không tự viết if/throw lặp lại.
 * Lưu ý (docs/nfr.md mục 3): quyền được nhúng vào JWT lúc đăng nhập — đổi
 * quyền của user cần đăng nhập lại mới có hiệu lực (chấp nhận được ở Phase 1).
 */
export function requirePermission(
  session: SessionPayload | null,
  resource: string,
  action: string
): asserts session is SessionPayload {
  if (!session) throw unauthenticatedError();
  const code = permissionCode(resource, action);
  if (!session.permissions.includes(code)) {
    throw forbiddenError(`Bạn không có quyền "${action}" trên "${resource}"`);
  }
}

export function requireAuthenticated(
  session: SessionPayload | null
): asserts session is SessionPayload {
  if (!session) throw unauthenticatedError();
}
