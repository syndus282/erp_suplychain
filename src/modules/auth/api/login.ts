import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api/response";
import { unauthenticatedError, forbiddenError } from "@/lib/api/errors";
import { verifyPassword } from "../lib/password";
import { createSessionToken, setSessionCookie } from "../lib/session";
import { loadUserPermissions } from "../lib/permissions";

const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export async function loginHandler(request: Request): Promise<Response> {
  const body = loginSchema.parse(await request.json());

  const user = await prisma.user.findUnique({ where: { username: body.username } });
  if (!user) throw unauthenticatedError("Sai tên đăng nhập hoặc mật khẩu");

  const validPassword = await verifyPassword(body.password, user.passwordHash);
  if (!validPassword) throw unauthenticatedError("Sai tên đăng nhập hoặc mật khẩu");

  if (user.status !== "ACTIVE") {
    throw forbiddenError("Tài khoản đang bị khóa hoặc vô hiệu hóa, liên hệ quản trị viên");
  }

  const { roles, permissions } = await loadUserPermissions(user.id);

  const token = await createSessionToken({
    sub: user.id,
    companyId: user.companyId,
    username: user.username,
    employeeId: user.employeeId,
    roles,
    permissions,
  });
  await setSessionCookie(token);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return apiSuccess({
    id: user.id,
    username: user.username,
    companyId: user.companyId,
    roles,
    permissions,
  });
}
