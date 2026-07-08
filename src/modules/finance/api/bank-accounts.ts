import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  bankName: z.string().min(1, "Tên ngân hàng không được để trống"),
  accountNo: z.string().min(1, "Số tài khoản không được để trống"),
  currency: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const bankAccountApi = createCrudApi({
  resource: "bank-account",
  delegate: prisma.bankAccount,
  createSchema,
  updateSchema,
  searchFields: ["bankName", "accountNo"],
  defaultSort: { bankName: "asc" },
});
