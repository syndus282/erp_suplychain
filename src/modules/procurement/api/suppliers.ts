import { z } from "zod";
import { SupplierType, MasterDataStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã nhà cung cấp không được để trống"),
  name: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  type: z.nativeEnum(SupplierType),
  country: z.string().optional(),
  taxCode: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  paymentTerm: z.string().optional(),
  currency: z.string().optional(),
  contractNumber: z.string().optional(),
  feePolicy: z.string().optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
});

const updateSchema = createSchema.partial();

export const suppliersApi = createCrudApi({
  resource: "supplier",
  delegate: prisma.supplier,
  createSchema,
  updateSchema,
  searchFields: ["code", "name", "taxCode"],
  sortableFields: ["code", "name", "createdAt"],
});
