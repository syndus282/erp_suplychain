import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";

export interface PageMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function apiSuccess<T>(data: T, meta?: PageMeta, init?: number) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status: init ?? 200 }
  );
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  );
}

/**
 * Bọc route handler để tự động chuyển AppError/ZodError/lỗi không lường trước
 * thành đúng envelope lỗi chuẩn (docs/api-contract.md mục 3), tránh lặp
 * try/catch giống nhau ở mọi route.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return apiError(err.status, err.code, err.message, err.details);
      }
      if (err instanceof ZodError) {
        return apiError(400, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ", err.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })));
      }
      console.error(err);
      return apiError(500, "INTERNAL_ERROR", "Đã có lỗi hệ thống xảy ra");
    }
  };
}
