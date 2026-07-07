import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã phòng ban không được để trống"),
  name: z.string().min(1, "Tên phòng ban không được để trống"),
  branchId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

export const departmentsApi = createCrudApi({
  resource: "department",
  delegate: prisma.department,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
  include: { branch: true },
});
