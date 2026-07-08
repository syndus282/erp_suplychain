import { z } from "zod";
import type { RepairOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";

/** Thứ tự trạng thái cố định theo docs/business-spec/07 mục 14. */
const SEQUENCE: RepairOrderStatus[] = ["RECEIVED", "DIAGNOSING", "REPAIRING", "TESTING", "COMPLETED", "RETURNED"];

const advanceSchema = z.object({ laborCost: z.number().int().nonnegative().optional() });

const include = {
  claim: { include: { registration: { include: { product: true } } } },
  technician: true,
};

export async function listRepairOrders(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "repair-order", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.repairOrder.findMany({ where, orderBy, skip, take, include }),
    prisma.repairOrder.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/** Chuyển sang bước kế tiếp trong chuỗi cố định — không cho nhảy cóc/lùi bước. */
export async function advanceRepairOrder(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "repair-order", "advance");

  const input = advanceSchema.parse(await request.json().catch(() => ({})));

  const repairOrder = await prisma.repairOrder.findUnique({ where: { id } });
  if (!repairOrder || repairOrder.companyId !== session.companyId) throw notFoundError();

  const currentIndex = SEQUENCE.indexOf(repairOrder.status);
  if (currentIndex === SEQUENCE.length - 1) {
    throw businessRuleError("Lệnh sửa chữa đã ở bước cuối cùng", { rule: "REPAIR_ORDER_ALREADY_DONE" });
  }

  const nextStatus = SEQUENCE[currentIndex + 1];
  const updated = await prisma.repairOrder.update({
    where: { id },
    data: { status: nextStatus, laborCost: input.laborCost ?? repairOrder.laborCost },
    include,
  });

  return apiSuccess(updated);
}
