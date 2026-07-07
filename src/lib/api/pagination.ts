import type { PageMeta } from "./response";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Đọc page/pageSize từ query string theo quy ước docs/api-contract.md mục 5. */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawPageSize = Number.parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawPageSize || DEFAULT_PAGE_SIZE));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPageMeta(page: number, pageSize: number, totalItems: number): PageMeta {
  return { page, pageSize, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) };
}

/**
 * Đọc param `sort=field:asc,field2:desc` thành mảng orderBy Prisma.
 * `allowedFields` chặn sort theo field không có index/không mong muốn.
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: readonly string[],
  fallback: Record<string, "asc" | "desc"> = { createdAt: "desc" }
): Record<string, "asc" | "desc">[] {
  const raw = searchParams.get("sort");
  if (!raw) return [fallback];

  const clauses = raw
    .split(",")
    .map((part) => {
      const [field, dir] = part.split(":");
      if (!field || !allowedFields.includes(field)) return null;
      return { [field]: dir === "desc" ? "desc" : "asc" } as Record<string, "asc" | "desc">;
    })
    .filter((c): c is Record<string, "asc" | "desc"> => c !== null);

  return clauses.length > 0 ? clauses : [fallback];
}
