import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã đơn vị tính không được để trống"),
  name: z.string().min(1, "Tên đơn vị tính không được để trống"),
});

const updateSchema = createSchema.partial();

export const uomApi = createCrudApi({
  resource: "uom",
  delegate: prisma.unitOfMeasure,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
