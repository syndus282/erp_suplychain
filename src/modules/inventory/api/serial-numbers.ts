import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

export async function listSerialNumbers(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "serial-number", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const productId = url.searchParams.get("productId");
  const warehouseId = url.searchParams.get("warehouseId");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const where = {
    companyId: session.companyId,
    ...(productId ? { productId } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(status ? { status: status as never } : {}),
    ...(search ? { serialNo: { contains: search } } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.serialNumber.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { product: true, warehouse: true },
    }),
    prisma.serialNumber.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}
