import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã đơn vị vận chuyển không được để trống"),
  name: z.string().min(1, "Tên đơn vị vận chuyển không được để trống"),
  contractNo: z.string().optional(),
  serviceArea: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const carrierApi = createCrudApi({
  resource: "carrier",
  delegate: prisma.carrier,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
