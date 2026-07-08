import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  productId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  durationMonths: z.number().int().positive("Thời hạn bảo hành phải lớn hơn 0"),
  conditions: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const warrantyPolicyApi = createCrudApi({
  resource: "warranty-policy",
  delegate: prisma.warrantyPolicy,
  createSchema,
  updateSchema,
  defaultSort: { id: "asc" },
  include: { product: true, category: true },
});
