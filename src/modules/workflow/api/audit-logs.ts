import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

/** Audit Trail chỉ đọc (docs/business-spec/12 mục 30) — ghi tự động từ decideApprovalStep, không có form tạo/sửa tay. */
export async function listAuditLogs(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "audit-log", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const entityType = url.searchParams.get("entityType");
  const entityId = url.searchParams.get("entityId");

  const where = {
    companyId: session.companyId,
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { changedBy: { select: { username: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}
