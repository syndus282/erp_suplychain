import { z } from "zod";
import { WarehouseType, MasterDataStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã kho không được để trống"),
  name: z.string().min(1, "Tên kho không được để trống"),
  type: z.nativeEnum(WarehouseType),
  address: z.string().optional(),
  branchId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
});

const updateSchema = createSchema.partial();

export const warehousesApi = createCrudApi({
  resource: "warehouse",
  delegate: prisma.warehouse,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
