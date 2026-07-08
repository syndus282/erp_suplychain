import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

const checkInSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  shiftId: z.string().nullable().optional(),
});

const checkOutSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
});

const include = { employee: { select: { id: true, code: true, fullName: true } }, shift: true };

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** "HH:mm" -> số phút kể từ 00:00, dùng để tính giờ chuẩn của ca làm việc. */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function listAttendance(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "attendance", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const employeeId = url.searchParams.get("employeeId");

  const employeeIds = await prisma.employee.findMany({ where: { companyId: session.companyId }, select: { id: true } });
  const where = { employeeId: employeeId ?? { in: employeeIds.map((e) => e.id) } };

  const [items, totalItems] = await Promise.all([
    prisma.attendanceRecord.findMany({ where, orderBy: { date: "desc" }, skip, take, include }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

async function assertEmployeeInCompany(employeeId: string, companyId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.companyId !== companyId) throw validationError("Nhân viên không hợp lệ");
}

export async function checkIn(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "attendance", "check-in");

  const input = checkInSchema.parse(await request.json());
  await assertEmployeeInCompany(input.employeeId, session.companyId);

  const date = startOfToday();
  const existing = await prisma.attendanceRecord.findUnique({ where: { employeeId_date: { employeeId: input.employeeId, date } } });
  if (existing?.checkIn) {
    throw businessRuleError("Nhân viên đã chấm công vào hôm nay", { rule: "ALREADY_CHECKED_IN" });
  }

  const record = existing
    ? await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), shiftId: input.shiftId ?? existing.shiftId },
        include,
      })
    : await prisma.attendanceRecord.create({
        data: { employeeId: input.employeeId, date, checkIn: new Date(), shiftId: input.shiftId ?? undefined },
        include,
      });

  return apiSuccess(record, undefined, 201);
}

export async function checkOut(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "attendance", "check-out");

  const input = checkOutSchema.parse(await request.json());
  await assertEmployeeInCompany(input.employeeId, session.companyId);

  const date = startOfToday();
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date } },
    include: { shift: true },
  });
  if (!existing || !existing.checkIn) {
    throw businessRuleError("Nhân viên chưa chấm công vào hôm nay", { rule: "NOT_CHECKED_IN" });
  }
  if (existing.checkOut) {
    throw businessRuleError("Nhân viên đã chấm công ra hôm nay", { rule: "ALREADY_CHECKED_OUT" });
  }

  const checkOutAt = new Date();
  const actualHours = (checkOutAt.getTime() - existing.checkIn.getTime()) / (60 * 60 * 1000);

  let otHours = 0;
  if (existing.shift) {
    const standardHours = (parseTimeToMinutes(existing.shift.endTime) - parseTimeToMinutes(existing.shift.startTime)) / 60;
    otHours = Math.max(0, Math.round((actualHours - standardHours) * 100) / 100);
  }

  const updated = await prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: { checkOut: checkOutAt, otHours },
    include,
  });

  return apiSuccess(updated);
}
