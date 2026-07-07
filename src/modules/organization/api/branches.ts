import { z } from "zod";
import { BranchType, MasterDataStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã chi nhánh không được để trống"),
  name: z.string().min(1, "Tên chi nhánh không được để trống"),
  address: z.string().optional(),
  type: z.nativeEnum(BranchType).optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
});

const updateSchema = createSchema.partial();

export const branchesApi = createCrudApi({
  resource: "branch",
  delegate: prisma.branch,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
