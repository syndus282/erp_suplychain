import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError, validationError } from "@/lib/api/errors";

// PriceListItem không có companyId trực tiếp — công ty xác định gián tiếp
// qua PriceList cha, nên không dùng crud-factory chung (giống StorageLocation).

const createSchema = z.object({
  priceListId: z.string().min(1, "Phải chọn bảng giá"),
  productId: z.string().min(1, "Phải chọn sản phẩm"),
  unitPrice: z.number().int().nonnegative(),
  currency: z.string().optional(),
  minQty: z.number().nonnegative().optional(),
});

const updateSchema = createSchema.omit({ priceListId: true }).partial();

async function assertPriceListInCompany(priceListId: string, companyId: string) {
  const priceList = await prisma.priceList.findUnique({ where: { id: priceListId } });
  if (!priceList || priceList.companyId !== companyId) {
    throw validationError("Bảng giá không hợp lệ");
  }
}

export async function listPriceListItems(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "price-list", "read");

  const url = new URL(request.url);
  const priceListId = url.searchParams.get("priceListId");
  if (!priceListId) throw validationError("Thiếu tham số priceListId");
  await assertPriceListInCompany(priceListId, session.companyId);

  const items = await prisma.priceListItem.findMany({
    where: { priceListId },
    include: { product: true },
    orderBy: { id: "asc" },
  });
  return apiSuccess(items);
}

export async function createPriceListItem(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "price-list", "update");

  const input = createSchema.parse(await request.json());
  await assertPriceListInCompany(input.priceListId, session.companyId);

  const created = await prisma.priceListItem.create({
    data: { ...input, currency: input.currency ?? "VND" },
    include: { product: true },
  });
  return apiSuccess(created, undefined, 201);
}

export async function updatePriceListItem(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "price-list", "update");

  const existing = await prisma.priceListItem.findUnique({ where: { id } });
  if (!existing) throw notFoundError();
  await assertPriceListInCompany(existing.priceListId, session.companyId);

  const input = updateSchema.parse(await request.json());
  const updated = await prisma.priceListItem.update({ where: { id }, data: input, include: { product: true } });
  return apiSuccess(updated);
}

export async function deletePriceListItem(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "price-list", "update");

  const existing = await prisma.priceListItem.findUnique({ where: { id } });
  if (!existing) throw notFoundError();
  await assertPriceListInCompany(existing.priceListId, session.companyId);

  await prisma.priceListItem.delete({ where: { id } });
  return apiSuccess({ id });
}
