import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const baseSchema = {
  transactionType: z.string().min(1, "Phải chọn loại giao dịch"),
  minAmount: z.number().int().nonnegative(),
  maxAmount: z.number().int().positive().nullable().optional(),
  approverRoleId: z.string().min(1, "Phải chọn vai trò duyệt"),
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object(baseSchema).partial();

export const approvalMatrixApi = createCrudApi({
  resource: "approval-matrix",
  delegate: prisma.approvalMatrix,
  createSchema,
  updateSchema,
  sortableFields: ["minAmount", "transactionType"],
  defaultSort: { minAmount: "asc" },
  include: { approverRole: true },
});
