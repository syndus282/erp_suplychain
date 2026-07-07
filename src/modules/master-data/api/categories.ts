import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã nhóm hàng không được để trống"),
  name: z.string().min(1, "Tên nhóm hàng không được để trống"),
  parentId: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

export const categoriesApi = createCrudApi({
  resource: "product-category",
  delegate: prisma.productCategory,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
