import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

export async function listStockMovements(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "stock-movement", "read");

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
    prisma.stockMovement.findMany({
      where,
      skip,
      take,
      orderBy: { movementDate: "desc" },
      include: { warehouse: true, product: true, lot: true },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}
