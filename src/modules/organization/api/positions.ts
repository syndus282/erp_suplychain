import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã chức vụ không được để trống"),
  name: z.string().min(1, "Tên chức vụ không được để trống"),
});

const updateSchema = createSchema.partial();

export const positionsApi = createCrudApi({
  resource: "position",
  delegate: prisma.position,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
