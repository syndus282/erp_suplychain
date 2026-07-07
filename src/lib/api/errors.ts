// Mã lỗi chuẩn — xem docs/api-contract.md mục 3.
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_VIOLATION"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BUSINESS_RULE_VIOLATION: 422,
  INTERNAL_ERROR: 500,
};

/** Lỗi có chủ đích, được route handler bắt và trả về đúng envelope chuẩn. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

export const validationError = (message: string, details?: unknown) =>
  new ApiError("VALIDATION_ERROR", message, details);

export const unauthenticatedError = (message = "Chưa đăng nhập hoặc phiên đã hết hạn") =>
  new ApiError("UNAUTHENTICATED", message);

export const forbiddenError = (message = "Bạn không có quyền thực hiện thao tác này") =>
  new ApiError("FORBIDDEN", message);

export const notFoundError = (message = "Không tìm thấy bản ghi") =>
  new ApiError("NOT_FOUND", message);

export const conflictError = (message: string, details?: unknown) =>
  new ApiError("CONFLICT", message, details);

export const businessRuleError = (message: string, details?: unknown) =>
  new ApiError("BUSINESS_RULE_VIOLATION", message, details);
