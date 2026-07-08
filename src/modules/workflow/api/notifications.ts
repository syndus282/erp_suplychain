import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError } from "@/lib/api/errors";

/** Inbox thông báo của chính user đang đăng nhập (docs/business-spec/12 mục 27). */
export async function listNotifications(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "notification", "read");

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";

  const items = await prisma.notification.findMany({
    where: { userId: session.sub, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: session.sub, isRead: false } });

  return apiSuccess({ items, unreadCount });
}

export async function markNotificationRead(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "notification", "read");

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.sub) throw notFoundError();

  const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return apiSuccess(updated);
}

export async function markAllNotificationsRead() {
  const session = await getCurrentSession();
  requirePermission(session, "notification", "read");

  await prisma.notification.updateMany({ where: { userId: session.sub, isRead: false }, data: { isRead: true } });
  return apiSuccess({ ok: true });
}
