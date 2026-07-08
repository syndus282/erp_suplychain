import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";
import { postJournalEntry } from "@/modules/finance/lib/posting";
import { getActiveContract } from "./employment-contracts";

/**
 * Giả định đơn giản hóa cho Phase 9 (docs/ROADMAP.md chỉ yêu cầu "lương cơ
 * bản" — KHÔNG yêu cầu đúng luật BHXH/thuế TNCN thật, tránh code cứng công
 * thức thuế/bảo hiểm sai luật gây hiểu nhầm là tính năng tuân thủ pháp lý):
 * - 1 tháng công chuẩn = 26 ngày x 8 giờ = 208 giờ.
 * - Hệ số tăng ca = 1.5 lần lương giờ (mức tối thiểu ngày thường theo Bộ luật
 *   Lao động, dùng làm mặc định — KHÔNG phân biệt ngày lễ/cuối tuần).
 * - Bảo hiểm/thuế: nhập tay (mặc định 0), KHÔNG tự tính theo bậc thuế thật.
 */
const STANDARD_MONTHLY_HOURS = 208;
const OT_MULTIPLIER = 1.5;

const generateSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Kỳ lương phải theo định dạng YYYY-MM"),
  allowance: z.number().int().nonnegative().optional(),
  bonus: z.number().int().nonnegative().optional(),
  insuranceDeduction: z.number().int().nonnegative().optional(),
  taxDeduction: z.number().int().nonnegative().optional(),
});

const include = { employee: { select: { id: true, code: true, fullName: true } } };

export async function listPayrolls(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "payroll", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.payroll.findMany({ where, orderBy: { period: "desc" }, skip, take, include }),
    prisma.payroll.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

function periodRange(period: string): { start: Date; end: Date } {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function generatePayroll(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "payroll", "generate");

  const input = generateSchema.parse(await request.json());

  const employee = await prisma.employee.findUnique({ where: { id: input.employeeId } });
  if (!employee || employee.companyId !== session.companyId) throw validationError("Nhân viên không hợp lệ");

  const existing = await prisma.payroll.findUnique({
    where: { employeeId_period: { employeeId: input.employeeId, period: input.period } },
  });
  if (existing && existing.status !== "DRAFT") {
    throw businessRuleError("Bảng lương kỳ này đã được xác nhận/đã trả, không thể tính lại", {
      rule: "PAYROLL_NOT_DRAFT",
      currentStatus: existing.status,
    });
  }

  const { start, end } = periodRange(input.period);
  const contract = await getActiveContract(input.employeeId, end);

  const commissionAgg = await prisma.commissionRecord.aggregate({
    where: { employeeId: input.employeeId, period: input.period },
    _sum: { amount: true },
  });
  const commission = commissionAgg._sum.amount ?? 0;

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: { employeeId: input.employeeId, date: { gte: start, lt: end } },
  });
  const totalOtHours = attendanceRecords.reduce((sum, r) => sum + r.otHours, 0);
  const hourlyRate = contract.baseSalary / STANDARD_MONTHLY_HOURS;
  const otAmount = Math.round(totalOtHours * hourlyRate * OT_MULTIPLIER);

  const allowance = input.allowance ?? 0;
  const bonus = input.bonus ?? 0;
  const insuranceDeduction = input.insuranceDeduction ?? 0;
  const taxDeduction = input.taxDeduction ?? 0;
  const netAmount = contract.baseSalary + allowance + bonus + commission + otAmount - insuranceDeduction - taxDeduction;

  const payroll = await prisma.payroll.upsert({
    where: { employeeId_period: { employeeId: input.employeeId, period: input.period } },
    update: {
      baseSalary: contract.baseSalary,
      allowance,
      bonus,
      commission,
      otAmount,
      insuranceDeduction,
      taxDeduction,
      netAmount,
      currency: contract.currency,
      status: "DRAFT",
    },
    create: {
      companyId: session.companyId,
      employeeId: input.employeeId,
      period: input.period,
      baseSalary: contract.baseSalary,
      allowance,
      bonus,
      commission,
      otAmount,
      insuranceDeduction,
      taxDeduction,
      netAmount,
      currency: contract.currency,
      status: "DRAFT",
    },
    include,
  });

  return apiSuccess(payroll, undefined, 201);
}

export async function confirmPayroll(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "payroll", "confirm");

  const payroll = await prisma.payroll.findUnique({ where: { id } });
  if (!payroll || payroll.companyId !== session.companyId) throw notFoundError();
  if (payroll.status !== "DRAFT") {
    throw businessRuleError("Chỉ có thể xác nhận bảng lương đang ở trạng thái Nháp", {
      rule: "PAYROLL_NOT_DRAFT",
      currentStatus: payroll.status,
    });
  }

  const updated = await prisma.payroll.update({ where: { id }, data: { status: "CONFIRMED" }, include });
  return apiSuccess(updated);
}

/** Trả lương — ghi bút toán chi phí lương (docs/business-spec/08 mục 5 "Lương" là 1 nguồn tạo bút toán GL). */
export async function payPayroll(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "payroll", "pay");

  const payroll = await prisma.payroll.findUnique({ where: { id } });
  if (!payroll || payroll.companyId !== session.companyId) throw notFoundError();
  if (payroll.status !== "CONFIRMED") {
    throw businessRuleError("Chỉ có thể trả lương cho bảng lương đã xác nhận", {
      rule: "PAYROLL_NOT_CONFIRMED",
      currentStatus: payroll.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await postJournalEntry(tx, {
      companyId: session.companyId,
      refType: "Payroll",
      refId: payroll.id,
      description: `Trả lương kỳ ${payroll.period}`,
      lines: [
        { accountCode: "642", debit: payroll.netAmount },
        { accountCode: "111", credit: payroll.netAmount },
      ],
    });
    return tx.payroll.update({ where: { id }, data: { status: "PAID" }, include });
  });

  return apiSuccess(updated);
}
