import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";

const createSchema = z.object({
  code: z.string().min(1, "Mã tài sản không được để trống"),
  name: z.string().min(1, "Tên tài sản không được để trống"),
  purchaseDate: z.string().transform((v) => new Date(v)),
  originalCost: z.number().int().positive("Nguyên giá phải lớn hơn 0"),
  usefulLifeMonths: z.number().int().positive("Thời gian sử dụng phải lớn hơn 0"),
});

export async function listFixedAssets(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "fixed-asset", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "purchaseDate"], { purchaseDate: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.fixedAsset.findMany({ where, orderBy, skip, take }),
    prisma.fixedAsset.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createFixedAsset(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "fixed-asset", "create");

  const input = createSchema.parse(await request.json());

  const created = await prisma.fixedAsset.create({
    data: { ...input, companyId: session.companyId, currentValue: input.originalCost },
  });

  return apiSuccess(created, undefined, 201);
}

/**
 * Khấu hao đường thẳng (docs/business-spec/08 mục 19) — mỗi lần bấm trừ đúng
 * 1 kỳ (originalCost / usefulLifeMonths) khỏi currentValue, chặn ở 0 (không
 * âm). Chưa có job tự động chạy hàng tháng — thao tác thủ công cho Phase 8.
 */
export async function depreciateFixedAsset(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "fixed-asset", "depreciate");

  const asset = await prisma.fixedAsset.findUnique({ where: { id } });
  if (!asset || asset.companyId !== session.companyId) throw notFoundError();
  if (asset.currentValue <= 0) {
    throw businessRuleError("Tài sản đã khấu hao hết", { rule: "FIXED_ASSET_FULLY_DEPRECIATED" });
  }

  const monthlyDepreciation = Math.round(asset.originalCost / asset.usefulLifeMonths);
  const newValue = Math.max(0, asset.currentValue - monthlyDepreciation);

  const updated = await prisma.fixedAsset.update({ where: { id }, data: { currentValue: newValue } });
  return apiSuccess(updated);
}
