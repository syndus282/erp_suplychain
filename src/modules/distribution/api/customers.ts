import { z } from "zod";
import { CustomerType, CustomerSegment, MasterDataStatus, DealerTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";

const dealerProfileSchema = z.object({
  tier: z.nativeEnum(DealerTier).optional(),
  region: z.string().optional(),
  contractNumber: z.string().optional(),
  contractStart: optionalDateInput(),
  contractEnd: optionalDateInput(),
  committedRevenue: z.number().int().nonnegative().optional(),
  discountPolicy: z.string().optional(),
});

const customerSchema = z.object({
  code: z.string().min(1, "Mã khách hàng không được để trống"),
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  type: z.nativeEnum(CustomerType),
  taxCode: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  segment: z.nativeEnum(CustomerSegment).optional(),
  salesRepId: z.string().nullable().optional(),
  // priceListId: gán bảng giá (docs/business-spec/05 mục 5.3) — dùng ở Phase 5
  // để kiểm tra chính sách giá khi xác nhận Sales Order.
  priceListId: z.string().nullable().optional(),
  creditLimit: z.number().int().nonnegative().optional(),
  creditTermDays: z.number().int().nonnegative().optional(),
  status: z.nativeEnum(MasterDataStatus).optional(),
  dealerProfile: dealerProfileSchema.optional(),
});

const updateSchema = customerSchema.partial();

const include = { dealerProfile: true, salesRep: true };

export async function listCustomers(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "customer", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const search = url.searchParams.get("search");
  const type = url.searchParams.get("type");
  const orderBy = parseSort(url.searchParams, ["code", "name", "createdAt"]);

  const where: Record<string, unknown> = { companyId: session.companyId };
  if (type) where.type = type;
  if (search) {
    where.OR = [{ code: { contains: search } }, { name: { contains: search } }, { taxCode: { contains: search } }];
  }

  const [items, totalItems] = await Promise.all([
    prisma.customer.findMany({ where, orderBy, skip, take, include }),
    prisma.customer.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createCustomer(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "customer", "create");

  const input = customerSchema.parse(await request.json());
  const { dealerProfile, ...scalarFields } = input;

  const created = await prisma.customer.create({
    data: {
      ...scalarFields,
      companyId: session.companyId,
      ...(input.type === "DEALER" && dealerProfile ? { dealerProfile: { create: dealerProfile } } : {}),
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function updateCustomer(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "customer", "update");

  const input = updateSchema.parse(await request.json());
  const existing = await prisma.customer.findUnique({ where: { id }, include: { dealerProfile: true } });
  if (!existing || existing.companyId !== session.companyId) throw notFoundError();

  const { dealerProfile, ...scalarFields } = input;

  const updated = await prisma.$transaction(async (tx) => {
    if (dealerProfile && (input.type ?? existing.type) === "DEALER") {
      if (existing.dealerProfile) {
        await tx.dealerProfile.update({ where: { customerId: id }, data: dealerProfile });
      } else {
        await tx.dealerProfile.create({ data: { ...dealerProfile, customerId: id } });
      }
    }
    return tx.customer.update({ where: { id }, data: scalarFields, include });
  });

  return apiSuccess(updated);
}
