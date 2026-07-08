import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/errors";
import { parsePagination, buildPageMeta } from "@/lib/api/pagination";

const createSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  soId: z.string().nullable().optional(),
  amount: z.number().int().positive("Số tiền hoa hồng phải lớn hơn 0"),
  period: z.string().min(1, "Phải nhập kỳ lương (vd. 2026-07)"),
});

const include = {
  employee: { select: { id: true, code: true, fullName: true } },
  salesOrder: { select: { id: true, code: true } },
};

export async function listCommissionRecords(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "commission-record", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const employeeId = url.searchParams.get("employeeId");
  const period = url.searchParams.get("period");

  const employeeIds = await prisma.employee.findMany({ where: { companyId: session.companyId }, select: { id: true } });
  const where = {
    employeeId: employeeId ?? { in: employeeIds.map((e) => e.id) },
    ...(period ? { period } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.commissionRecord.findMany({ where, orderBy: { period: "desc" }, skip, take, include }),
    prisma.commissionRecord.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Ghi nhận hoa hồng bán hàng — "liên kết Sales" theo docs/ROADMAP.md Phase 9
 * qua `soId` (tùy chọn). Tính sẵn % hoa hồng theo giá trị đơn hàng để lại
 * cho UI (client tự tính rồi gửi `amount` cuối cùng) — tránh code cứng biểu
 * phí hoa hồng theo từng nhóm nhân viên/sản phẩm chưa được xác nhận nghiệp vụ.
 */
export async function createCommissionRecord(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "commission-record", "create");

  const input = createSchema.parse(await request.json());

  const employee = await prisma.employee.findUnique({ where: { id: input.employeeId } });
  if (!employee || employee.companyId !== session.companyId) throw validationError("Nhân viên không hợp lệ");

  if (input.soId) {
    const so = await prisma.salesOrder.findUnique({ where: { id: input.soId } });
    if (!so || so.companyId !== session.companyId) throw validationError("Đơn hàng bán không hợp lệ");
  }

  const created = await prisma.commissionRecord.create({ data: input, include });
  return apiSuccess(created, undefined, 201);
}
