import { z } from "zod";

/**
 * Field ngày giờ optional nhận vào từ form (`<input type="date">` chỉ gửi
 * "YYYY-MM-DD", không có phần giờ) — Prisma yêu cầu ISO-8601 DateTime đầy đủ
 * hoặc đối tượng Date, KHÔNG chấp nhận chuỗi ngày rút gọn. Chuyển "" thành
 * `undefined` (không gửi field) thay vì để Prisma báo lỗi parse.
 */
export const optionalDateInput = () =>
  z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined));
