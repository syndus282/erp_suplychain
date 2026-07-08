/**
 * Hằng số session tách riêng khỏi session.ts — session.ts import
 * `permissions.ts` (kéo theo Prisma) để nạp permission mỗi request, nhưng
 * `src/middleware.ts` chạy Edge runtime và KHÔNG được phép kéo Prisma vào
 * bundle (không tương thích, cũng làm phình bundle middleware). Middleware
 * PHẢI import hằng số này trực tiếp, KHÔNG import từ session.ts.
 */
export const SESSION_COOKIE_NAME = "erp_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h — 1 ca làm việc.
