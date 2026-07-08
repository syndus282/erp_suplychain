import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";

/** Aging Report công nợ phải thu (docs/business-spec/08 mục 14) — nhóm theo số ngày quá hạn tính từ `dueDate`. */
export async function getArAgingReport() {
  const session = await getCurrentSession();
  requirePermission(session, "customer-invoice", "read");

  const invoices = await prisma.customerInvoice.findMany({
    where: { companyId: session.companyId, status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] } },
    include: { customer: { select: { id: true, code: true, name: true } } },
  });

  const now = Date.now();
  const buckets = {
    current: [] as typeof invoices,
    days0to30: [] as typeof invoices,
    days31to60: [] as typeof invoices,
    days61to90: [] as typeof invoices,
    over90: [] as typeof invoices,
  };

  for (const inv of invoices) {
    const outstanding = inv.amount - inv.paidAmount;
    if (outstanding <= 0) continue;
    const daysOverdue = inv.dueDate ? Math.floor((now - inv.dueDate.getTime()) / (24 * 60 * 60 * 1000)) : -1;

    if (daysOverdue < 0) buckets.current.push(inv);
    else if (daysOverdue <= 30) buckets.days0to30.push(inv);
    else if (daysOverdue <= 60) buckets.days31to60.push(inv);
    else if (daysOverdue <= 90) buckets.days61to90.push(inv);
    else buckets.over90.push(inv);
  }

  const summarize = (rows: typeof invoices) => ({
    count: rows.length,
    totalOutstanding: rows.reduce((s, r) => s + (r.amount - r.paidAmount), 0),
    invoices: rows.map((r) => ({
      id: r.id,
      code: r.code,
      customer: r.customer,
      outstanding: r.amount - r.paidAmount,
      dueDate: r.dueDate,
    })),
  });

  return apiSuccess({
    current: summarize(buckets.current),
    days0to30: summarize(buckets.days0to30),
    days31to60: summarize(buckets.days31to60),
    days61to90: summarize(buckets.days61to90),
    over90: summarize(buckets.over90),
  });
}
