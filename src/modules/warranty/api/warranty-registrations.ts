import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  productId: z.string().min(1, "Phải chọn sản phẩm"),
  serialId: z.string().nullable().optional(),
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  soId: z.string().nullable().optional(),
  vehicleModelId: z.string().nullable().optional(),
  soldAt: optionalDateInput(),
});

const include = {
  product: true,
  serial: true,
  customer: true,
  salesOrder: { select: { id: true, code: true } },
  vehicleModel: true,
};

export async function listWarrantyRegistrations(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-registration", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["warrantyStart"], { warrantyStart: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.warrantyRegistration.findMany({ where, orderBy, skip, take, include }),
    prisma.warrantyRegistration.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Thời hạn bảo hành = ngày bán + số tháng theo WarrantyPolicy áp dụng cho
 * sản phẩm (ưu tiên policy theo productId, sau đó theo categoryId). Không có
 * policy nào áp dụng thì chặn đăng ký (docs/business-spec/07 mục 4.2 — mọi
 * sản phẩm bảo hành phải có chính sách trước).
 */
export async function createWarrantyRegistration(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-registration", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) throw validationError("Khách hàng không hợp lệ");

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || product.companyId !== session.companyId) throw validationError("Sản phẩm không hợp lệ");

  let policy = await prisma.warrantyPolicy.findFirst({ where: { companyId: session.companyId, productId: input.productId } });
  if (!policy && product.categoryId) {
    policy = await prisma.warrantyPolicy.findFirst({ where: { companyId: session.companyId, categoryId: product.categoryId } });
  }
  if (!policy) {
    throw businessRuleError("Sản phẩm này chưa có chính sách bảo hành, không thể đăng ký", {
      rule: "NO_WARRANTY_POLICY",
    });
  }

  const soldAt = input.soldAt ?? new Date();
  const warrantyEnd = new Date(soldAt);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + policy.durationMonths);

  const created = await prisma.warrantyRegistration.create({
    data: {
      companyId: session.companyId,
      productId: input.productId,
      serialId: input.serialId ?? undefined,
      customerId: input.customerId,
      soId: input.soId ?? undefined,
      vehicleModelId: input.vehicleModelId ?? undefined,
      soldAt,
      warrantyStart: soldAt,
      warrantyEnd,
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}
