import { z } from "zod";
import { AccountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  code: z.string().min(1, "Mã tài khoản không được để trống"),
  name: z.string().min(1, "Tên tài khoản không được để trống"),
  type: z.nativeEnum(AccountType),
  parentId: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

export const accountApi = createCrudApi({
  resource: "account",
  delegate: prisma.account,
  createSchema,
  updateSchema,
  searchFields: ["code", "name"],
  sortableFields: ["code", "name", "createdAt"],
  include: { parent: true },
});
