import { z } from "zod";
import { ReconciliationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";

const createSchema = z.object({
  dealerId: z.string().min(1, "Phải chọn đại lý"),
  periodFrom: z.string().min(1, "Phải nhập từ ngày"),
  periodTo: z.string().min(1, "Phải nhập đến ngày"),
  dealerReportedQty: z.number().nonnegative(),
});

const updateSchema = z.object({ status: z.nativeEnum(ReconciliationStatus) });

const include = { dealer: true };

export async function listConsignmentReconciliations(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-reconciliation", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["createdAt"]);
  const dealerId = url.searchParams.get("dealerId");

  const where = { companyId: session.companyId, ...(dealerId ? { dealerId } : {}) };
  const [items, totalItems] = await Promise.all([
    prisma.consignmentReconciliation.findMany({ where, orderBy, skip, take, include }),
    prisma.consignmentReconciliation.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createConsignmentReconciliation(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-reconciliation", "create");

  const input = createSchema.parse(await request.json());
  const dealer = await prisma.customer.findUnique({ where: { id: input.dealerId } });
  if (!dealer || dealer.companyId !== session.companyId) throw validationError("Đại lý không hợp lệ");

  const balances = await prisma.consignmentBalance.findMany({ where: { dealerId: input.dealerId } });
  const systemQty = balances.reduce((sum, b) => sum + b.qtyOnHand, 0);

  const created = await prisma.consignmentReconciliation.create({
    data: {
      companyId: session.companyId,
      dealerId: input.dealerId,
      periodFrom: new Date(input.periodFrom),
      periodTo: new Date(input.periodTo),
      systemQty,
      dealerReportedQty: input.dealerReportedQty,
      varianceQty: input.dealerReportedQty - systemQty,
      status: "OPEN",
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function updateConsignmentReconciliation(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-reconciliation", "update");

  const existing = await prisma.consignmentReconciliation.findUnique({ where: { id } });
  if (!existing || existing.companyId !== session.companyId) throw notFoundError();

  const input = updateSchema.parse(await request.json());
  const updated = await prisma.consignmentReconciliation.update({
    where: { id },
    data: { status: input.status },
    include,
  });

  return apiSuccess(updated);
}
