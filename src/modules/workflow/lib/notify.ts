import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

/** Tạo Notification cho 1 user cụ thể (docs/business-spec/12 mục 27). */
export async function notifyUser(
  params: { companyId: string; userId: string; type: string; title: string; message?: string },
  client: PrismaClientOrTx = prisma
) {
  return client.notification.create({
    data: {
      companyId: params.companyId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
    },
  });
}

/** Tạo Notification cho toàn bộ user đang giữ 1 role (vd. approver theo role). */
export async function notifyRole(
  params: { companyId: string; roleId: string; type: string; title: string; message?: string },
  client: PrismaClientOrTx = prisma
) {
  const userRoles = await client.userRole.findMany({ where: { roleId: params.roleId }, select: { userId: true } });
  if (userRoles.length === 0) return;
  await client.notification.createMany({
    data: userRoles.map((ur) => ({
      companyId: params.companyId,
      userId: ur.userId,
      type: params.type,
      title: params.title,
      message: params.message,
    })),
  });
}
