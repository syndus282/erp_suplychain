import { z } from "zod";
import { MasterDataStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";

const productSchema = z.object({
  code: z.string().min(1, "Mã hàng không được để trống"),
  name: z.string().min(1, "Tên hàng không được để trống"),
  tradeName: z.string().optional(),
  technicalName: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  baseUomId: z.string().nullable().optional(),
  brand: z.string().optional(),
  originCountry: z.string().optional(),
  oemCode: z.string().optional(),
  manufacturerCode: z.string().optional(),
  partNumber: z.string().optional(),
  supersededById: z.string().nullable().optional(),
  manageSerial: z.boolean().optional(),
  manageLot: z.boolean().optional(),
  manageExpiry: z.boolean().optional(),
  safetyStock: z.number().int().optional(),
  reorderPoint: z.number().int().optional(),
  moq: z.number().int().optional(),
  leadTimeDays: z.number().int().optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
  vehicleModelIds: z.array(z.string()).optional(),
});

const updateSchema = productSchema.partial();

const include = {
  category: true,
  baseUom: true,
  vehicleCompatibilities: { include: { vehicleModel: true } },
};

export async function listProducts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "product", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const search = url.searchParams.get("search");
  const orderBy = parseSort(url.searchParams, ["code", "name", "createdAt"]);

  const where: Record<string, unknown> = { companyId: session.companyId };
  if (search) {
    where.OR = [{ code: { contains: search } }, { name: { contains: search } }, { partNumber: { contains: search } }];
  }

  const [items, totalItems] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take, include }),
    prisma.product.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createProduct(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "product", "create");

  const input = productSchema.parse(await request.json());
  const { vehicleModelIds, ...scalarFields } = input;

  const created = await prisma.product.create({
    data: {
      ...scalarFields,
      companyId: session.companyId,
      ...(vehicleModelIds && vehicleModelIds.length > 0
        ? { vehicleCompatibilities: { create: vehicleModelIds.map((vehicleModelId) => ({ vehicleModelId })) } }
        : {}),
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function updateProduct(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "product", "update");

  const input = updateSchema.parse(await request.json());
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.companyId !== session.companyId) throw notFoundError();

  const { vehicleModelIds, ...scalarFields } = input;

  const updated = await prisma.$transaction(async (tx) => {
    if (vehicleModelIds !== undefined) {
      await tx.productVehicleCompatibility.deleteMany({ where: { productId: id } });
      if (vehicleModelIds.length > 0) {
        await tx.productVehicleCompatibility.createMany({
          data: vehicleModelIds.map((vehicleModelId) => ({ productId: id, vehicleModelId })),
        });
      }
    }
    return tx.product.update({ where: { id }, data: scalarFields, include });
  });

  return apiSuccess(updated);
}
