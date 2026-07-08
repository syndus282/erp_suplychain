import { z } from "zod";
import { PriceListType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  code: z.string().min(1, "Mã bảng giá không được để trống"),
  name: z.string().min(1, "Tên bảng giá không được để trống"),
  type: z.nativeEnum(PriceListType),
  currency: z.string().optional(),
  effectiveFrom: optionalDateInput(),
  effectiveTo: optionalDateInput(),
});

const updateSchema = createSchema.partial();

export const priceListApi = createCrudApi({
  resource: "price-list",
  delegate: prisma.priceList,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
});
