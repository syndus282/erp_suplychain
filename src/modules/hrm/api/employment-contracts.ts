import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { notFoundError, validationError } from "@/lib/api/errors";
import { optionalDateInput } from "@/lib/api/validation";

// EmploymentContract không có companyId trực tiếp — công ty xác định gián
// tiếp qua Employee cha, giống StorageLocation (Phase 1) và PriceListItem
// (Phase 5), nên không dùng crud-factory chung.

const createSchema = z.object({
  employeeId: z.string().min(1, "Phải chọn nhân viên"),
  type: z.string().optional(),
  startDate: z.string().transform((v) => new Date(v)),
  endDate: optionalDateInput(),
  baseSalary: z.number().int().positive("Lương cơ bản phải lớn hơn 0"),
  currency: z.string().optional(),
});

async function assertEmployeeInCompany(employeeId: string, companyId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.companyId !== companyId) throw validationError("Nhân viên không hợp lệ");
}

export async function listEmploymentContracts(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "employment-contract", "read");

  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId");
  if (!employeeId) throw validationError("Thiếu tham số employeeId");
  await assertEmployeeInCompany(employeeId, session.companyId);

  const items = await prisma.employmentContract.findMany({
    where: { employeeId },
    orderBy: { startDate: "desc" },
  });
  return apiSuccess(items);
}

export async function createEmploymentContract(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "employment-contract", "create");

  const input = createSchema.parse(await request.json());
  await assertEmployeeInCompany(input.employeeId, session.companyId);

  const created = await prisma.employmentContract.create({
    data: { ...input, currency: input.currency ?? "VND" },
  });
  return apiSuccess(created, undefined, 201);
}

/** Hợp đồng đang có hiệu lực (chưa hết hạn) mới nhất của 1 nhân viên — dùng để lấy `baseSalary` khi tính lương. */
export async function getActiveContract(employeeId: string, asOf: Date) {
  const contract = await prisma.employmentContract.findFirst({
    where: { employeeId, startDate: { lte: asOf }, OR: [{ endDate: null }, { endDate: { gte: asOf } }] },
    orderBy: { startDate: "desc" },
  });
  if (!contract) throw notFoundError("Nhân viên chưa có hợp đồng lao động còn hiệu lực");
  return contract;
}
