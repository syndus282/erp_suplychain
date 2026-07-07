import { z } from "zod";
import { StorageLocationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError, validationError } from "@/lib/api/errors";

// StorageLocation KHÔNG có companyId trực tiếp (xem docs/data-model.md mục 6)
// — công ty được xác định gián tiếp qua Warehouse cha, nên không dùng được
// crud-factory dùng chung (giả định companyId trực tiếp trên bảng).

const createSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho"),
  parentId: z.string().nullable().optional(),
  code: z.string().min(1, "Mã vị trí không được để trống"),
  type: z.nativeEnum(StorageLocationType),
  capacity: z.number().optional(),
});

const updateSchema = createSchema.omit({ warehouseId: true }).partial();

async function assertWarehouseInCompany(warehouseId: string, companyId: string) {
  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse || warehouse.companyId !== companyId) {
    throw validationError("Kho không hợp lệ");
  }
}

export async function listStorageLocations(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "storage-location", "read");

  const url = new URL(request.url);
  const warehouseId = url.searchParams.get("warehouseId");
  if (!warehouseId) throw validationError("Thiếu tham số warehouseId");
  await assertWarehouseInCompany(warehouseId, session.companyId);

  const items = await prisma.storageLocation.findMany({
    where: { warehouseId },
    orderBy: { code: "asc" },
  });
  return apiSuccess(items);
}

export async function createStorageLocation(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "storage-location", "create");

  const input = createSchema.parse(await request.json());
  await assertWarehouseInCompany(input.warehouseId, session.companyId);

  const created = await prisma.storageLocation.create({ data: input });
  return apiSuccess(created, undefined, 201);
}

export async function updateStorageLocation(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "storage-location", "update");

  const existing = await prisma.storageLocation.findUnique({ where: { id } });
  if (!existing) throw notFoundError();
  await assertWarehouseInCompany(existing.warehouseId, session.companyId);

  const input = updateSchema.parse(await request.json());
  const updated = await prisma.storageLocation.update({ where: { id }, data: input });
  return apiSuccess(updated);
}
