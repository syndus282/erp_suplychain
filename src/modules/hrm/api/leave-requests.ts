import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

const createSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  type: z.enum(["ANNUAL", "SICK", "UNPAID", "SPECIAL"]),
  fromDate: z.string().transform((v) => new Date(v)),
  toDate: z.string().transform((v) => new Date(v)),
});

const include = { employee: { select: { id: true, code: true, fullName: true } } };

export async function listLeaveRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "leave-request", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);

  const employeeIds = await prisma.employee.findMany({ where: { companyId: session.companyId }, select: { id: true } });
  const where = { employeeId: { in: employeeIds.map((e) => e.id) } };

  const [items, totalItems] = await Promise.all([
    prisma.leaveRequest.findMany({ where, orderBy: { createdAt: "desc" }, skip, take, include }),
    prisma.leaveRequest.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createLeaveRequest(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "leave-request", "create");

  const input = createSchema.parse(await request.json());
  const employee = await prisma.employee.findUnique({ where: { id: input.employeeId } });
  if (!employee || employee.companyId !== session.companyId) throw validationError("Nhân viên không hợp lệ");

  if (input.toDate < input.fromDate) {
    throw validationError("Ngày kết thúc phải sau ngày bắt đầu");
  }

  const created = await prisma.leaveRequest.create({
    data: { ...input, status: "PENDING" },
    include,
  });
  return apiSuccess(created, undefined, 201);
}

async function transition(id: string, companyId: string, to: "APPROVED" | "REJECTED") {
  const leave = await prisma.leaveRequest.findUnique({ where: { id }, include: { employee: true } });
  if (!leave || leave.employee.companyId !== companyId) throw notFoundError();
  if (leave.status !== "PENDING") {
    throw businessRuleError("Chỉ có thể duyệt/từ chối đơn nghỉ đang chờ xử lý", {
      rule: "LEAVE_REQUEST_NOT_PENDING",
      currentStatus: leave.status,
    });
  }
  return prisma.leaveRequest.update({ where: { id }, data: { status: to }, include });
}

export async function approveLeaveRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "leave-request", "approve");
  return apiSuccess(await transition(id, session.companyId, "APPROVED"));
}

export async function rejectLeaveRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "leave-request", "reject");
  return apiSuccess(await transition(id, session.companyId, "REJECTED"));
}
