import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";
import { optionalDateInput } from "@/lib/api/validation";

const requiredDateInput = () =>
  z
    .string()
    .min(1, "Phải nhập ngày bắt đầu")
    .transform((value) => new Date(value));

const baseSchema = {
  code: z.string().min(1, "Phải nhập mã hợp đồng"),
  type: z.enum(["SUPPLIER", "CUSTOMER", "SERVICE", "OTHER"]),
  title: z.string().min(1, "Phải nhập tên hợp đồng"),
  partnerType: z.enum(["Supplier", "Customer"]).nullable().optional(),
  partnerId: z.string().nullable().optional(),
  endDate: optionalDateInput(),
  value: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  fileUrl: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
};

const createSchema = z.object({ ...baseSchema, startDate: requiredDateInput() });
const updateSchema = z.object({ ...baseSchema, startDate: optionalDateInput() }).partial();

/**
 * Contract Management tổng quát (Phase 12, ưu tiên thấp nhất theo ROADMAP) —
 * CRUD đơn giản, không có workflow duyệt riêng (khác PurchaseOrder ở Phase
 * 10) vì đây là hồ sơ hành chính, không phải giao dịch tài chính cần kiểm
 * soát nhiều bước. Cảnh báo hợp đồng sắp hết hạn được tính trong
 * `src/modules/bi/api/alerts.ts` (Phase 11), không lặp lại logic ở đây.
 */
export const contractApi = createCrudApi({
  resource: "contract",
  delegate: prisma.contract,
  createSchema,
  updateSchema,
  searchFields: ["code", "title"],
  sortableFields: ["code", "title", "startDate", "endDate", "createdAt"],
});
