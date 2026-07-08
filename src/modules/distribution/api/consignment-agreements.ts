import { z } from "zod";
import { ReconciliationCycle } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  dealerId: z.string().min(1, "Phải chọn đại lý"),
  contractNo: z.string().optional(),
  effectiveFrom: optionalDateInput(),
  effectiveTo: optionalDateInput(),
  reconciliationCycle: z.nativeEnum(ReconciliationCycle).optional(),
  maxStockValue: z.number().int().nonnegative().optional(),
});

const updateSchema = createSchema.partial();

export const consignmentAgreementsApi = createCrudApi({
  resource: "consignment-agreement",
  delegate: prisma.consignmentAgreement,
  createSchema,
  updateSchema,
  sortableFields: ["createdAt"],
  include: { dealer: true },
});
