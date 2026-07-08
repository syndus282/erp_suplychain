import type { z } from "zod";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { apiSuccess } from "@/lib/api/response";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { notFoundError } from "@/lib/api/errors";

// Chữ ký tối thiểu chung cho mọi Prisma delegate dạng model.<x> — dùng `any`
// có chủ đích ở lớp hạ tầng này (tham số dùng `any` để tránh xung đột
// contravariance với type cụ thể của từng Prisma delegate) để tránh phải viết
// lại factory cho từng model, đổi lại là các module gọi factory
// (categories/uom/vehicle-models/warehouses) vẫn có type an toàn ở phía
// schema Zod + generic trả về.
/* eslint-disable @typescript-eslint/no-explicit-any */
interface CrudDelegate {
  findMany: (args: any) => Promise<Record<string, unknown>[]>;
  count: (args: any) => Promise<number>;
  create: (args: any) => Promise<Record<string, unknown>>;
  update: (args: any) => Promise<Record<string, unknown>>;
  findUnique: (args: any) => Promise<Record<string, unknown> | null>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface CrudConfig<TCreate, TUpdate> {
  /** Tên resource dùng cho permission check, vd. "product-category". */
  resource: string;
  delegate: CrudDelegate;
  // Input type parameter relaxed to `any` — schema có thể dùng `.transform()`
  // (vd. optionalDateInput()) nên input type khác output type (TCreate/TUpdate);
  // ở đây ta chỉ quan tâm output type sau khi `.parse()`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createSchema: z.ZodType<TCreate, z.ZodTypeDef, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSchema: z.ZodType<TUpdate, z.ZodTypeDef, any>;
  searchFields?: string[];
  sortableFields?: string[];
  /** Ghi đè sort mặc định khi model không có cột `createdAt` (vd. Driver). */
  defaultSort?: Record<string, "asc" | "desc">;
  include?: Record<string, unknown>;
}

/**
 * Factory CRUD dùng chung cho các master-data resource đơn giản (1 bảng,
 * companyId trực tiếp, không có quan hệ nhiều-nhiều cần xử lý riêng). Resource
 * có quan hệ phức tạp hơn (vd. Product có vehicle compatibility) viết handler
 * riêng, không ép vào factory này — xem docs/api-contract.md mục 7.
 */
export function createCrudApi<TCreate, TUpdate>(config: CrudConfig<TCreate, TUpdate>) {
  async function list(request: Request) {
    const session = await getCurrentSession();
    requirePermission(session, config.resource, "read");

    const url = new URL(request.url);
    const { page, pageSize, skip, take } = parsePagination(url.searchParams);
    const search = url.searchParams.get("search");
    const orderBy = parseSort(
      url.searchParams,
      config.sortableFields ?? ["createdAt"],
      config.defaultSort ?? { createdAt: "desc" }
    );

    const where: Record<string, unknown> = { companyId: session.companyId };
    if (search && config.searchFields?.length) {
      where.OR = config.searchFields.map((f) => ({ [f]: { contains: search } }));
    }

    const [items, totalItems] = await Promise.all([
      config.delegate.findMany({ where, orderBy, skip, take, include: config.include }),
      config.delegate.count({ where }),
    ]);

    return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
  }

  async function create(request: Request) {
    const session = await getCurrentSession();
    requirePermission(session, config.resource, "create");

    const input = config.createSchema.parse(await request.json());
    const created = await config.delegate.create({
      data: { ...input, companyId: session.companyId },
      include: config.include,
    });
    return apiSuccess(created, undefined, 201);
  }

  async function update(request: Request, id: string) {
    const session = await getCurrentSession();
    requirePermission(session, config.resource, "update");

    const input = config.updateSchema.parse(await request.json());
    const existing = await config.delegate.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.companyId) throw notFoundError();

    const updated = await config.delegate.update({
      where: { id },
      data: input,
      include: config.include,
    });
    return apiSuccess(updated);
  }

  return { list, create, update };
}
