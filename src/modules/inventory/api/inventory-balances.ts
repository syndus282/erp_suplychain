import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

export async function listInventoryBalances(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "inventory-balance", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const warehouseId = url.searchParams.get("warehouseId");
  const productId = url.searchParams.get("productId");

  const where = {
    companyId: session.companyId,
    ...(warehouseId ? { warehouseId } : {}),
    ...(productId ? { productId } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.inventoryBalance.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: { warehouse: true, product: true, lot: true },
    }),
    prisma.inventoryBalance.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}
