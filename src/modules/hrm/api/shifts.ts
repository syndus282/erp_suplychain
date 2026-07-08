import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudApi } from "@/lib/api/crud-factory";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống"),
  startTime: z.string().regex(timePattern, "Giờ bắt đầu phải theo định dạng HH:mm"),
  endTime: z.string().regex(timePattern, "Giờ kết thúc phải theo định dạng HH:mm"),
});

const updateSchema = createSchema.partial();

// Shift không có cột createdAt — sort theo tên.
export const shiftApi = createCrudApi({
  resource: "shift",
  delegate: prisma.shift,
  createSchema,
  updateSchema,
  defaultSort: { name: "asc" },
});
