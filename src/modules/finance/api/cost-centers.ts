import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã trung tâm chi phí không được để trống"),
  name: z.string().min(1, "Tên trung tâm chi phí không được để trống"),
});

const updateSchema = createSchema.partial();

export const costCenterApi = createCrudApi({
  resource: "cost-center",
  delegate: prisma.costCenter,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
