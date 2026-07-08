import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

export async function listConsignmentBalances(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-balance", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const dealerId = url.searchParams.get("dealerId");

  const where = { companyId: session.companyId, ...(dealerId ? { dealerId } : {}) };

  const [items, totalItems] = await Promise.all([
    prisma.consignmentBalance.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: { dealer: true, product: true },
    }),
    prisma.consignmentBalance.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}
