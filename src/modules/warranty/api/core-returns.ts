import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  newSerialId: z.string().min(1, "Phải chọn serial hàng mới đã giao"),
  oldSerialId: z.string().nullable().optional(),
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  dueReturnAt: optionalDateInput(),
});

const include = {
  newSerial: { include: { product: true } },
  oldSerial: { include: { product: true } },
  customer: true,
};

export async function listCoreReturns(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "core-return", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["deliveredAt"], { deliveredAt: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.coreReturn.findMany({ where, orderBy, skip, take, include }),
    prisma.coreReturn.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createCoreReturn(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "core-return", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) throw validationError("Khách hàng không hợp lệ");

  const created = await prisma.coreReturn.create({
    data: { ...input, companyId: session.companyId, status: "PENDING" },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function receiveCoreReturn(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "core-return", "receive");

  const coreReturn = await prisma.coreReturn.findUnique({ where: { id } });
  if (!coreReturn || coreReturn.companyId !== session.companyId) throw notFoundError();
  if (coreReturn.status !== "PENDING" && coreReturn.status !== "OVERDUE") {
    throw businessRuleError("Chỉ có thể nhận hàng cũ đang ở trạng thái Chờ trả hoặc Quá hạn", {
      rule: "CORE_RETURN_NOT_PENDING",
      currentStatus: coreReturn.status,
    });
  }

  const updated = await prisma.coreReturn.update({
    where: { id },
    data: { status: "RETURNED", returnedAt: new Date() },
    include,
  });
  return apiSuccess(updated);
}

export async function markCoreReturnOverdue(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "core-return", "overdue");

  const coreReturn = await prisma.coreReturn.findUnique({ where: { id } });
  if (!coreReturn || coreReturn.companyId !== session.companyId) throw notFoundError();
  if (coreReturn.status !== "PENDING") {
    throw businessRuleError("Chỉ có thể đánh dấu quá hạn khi đang Chờ trả", { rule: "CORE_RETURN_NOT_PENDING" });
  }

  const updated = await prisma.coreReturn.update({ where: { id }, data: { status: "OVERDUE" }, include });
  return apiSuccess(updated);
}

export async function markCoreReturnLost(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "core-return", "lost");

  const coreReturn = await prisma.coreReturn.findUnique({ where: { id } });
  if (!coreReturn || coreReturn.companyId !== session.companyId) throw notFoundError();
  if (coreReturn.status === "RETURNED") {
    throw businessRuleError("Không thể đánh dấu mất khi hàng đã được trả", { rule: "CORE_RETURN_ALREADY_RETURNED" });
  }

  const updated = await prisma.coreReturn.update({ where: { id }, data: { status: "LOST" }, include });
  return apiSuccess(updated);
}
