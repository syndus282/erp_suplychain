import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const createSchema = z.object({
  departmentId: z.string().nullable().optional(),
  costCenterId: z.string().nullable().optional(),
  period: z.string().min(1, "Phải nhập kỳ ngân sách (vd. 2026-Q1)"),
  category: z.string().min(1, "Phải nhập hạng mục ngân sách"),
  plannedAmount: z.number().int().positive("Số tiền dự toán phải lớn hơn 0"),
  currency: z.string().optional(),
});

const updateSchema = createSchema.partial();

// Budget không có cột createdAt — dùng period làm sort mặc định.
export const budgetApi = createCrudApi({
  resource: "budget",
  delegate: prisma.budget,
  createSchema,
  updateSchema,
  defaultSort: { period: "desc" },
  include: { department: true, costCenter: true },
});
