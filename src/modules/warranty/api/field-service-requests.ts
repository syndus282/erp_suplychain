import { z } from "zod";
import type { FieldServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "@/modules/procurement/lib/codegen";

const createSchema = z.object({
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  type: z.enum(["INSTALLATION", "MAINTENANCE", "REPAIR"]),
  scheduledAt: optionalDateInput(),
});

const assignSchema = z.object({ technicianId: z.string().min(1, "Phải chọn kỹ thuật viên") });

const include = { customer: true, technician: true };

export async function listFieldServiceRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.fieldServiceRequest.findMany({ where, orderBy, skip, take, include }),
    prisma.fieldServiceRequest.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createFieldServiceRequest(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) throw validationError("Khách hàng không hợp lệ");

  const created = await prisma.fieldServiceRequest.create({
    data: { ...input, companyId: session.companyId, code: generateCode("FSR"), status: "REQUESTED" },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

async function transition(id: string, companyId: string, from: FieldServiceStatus[], to: FieldServiceStatus, action: string) {
  const fsr = await prisma.fieldServiceRequest.findUnique({ where: { id } });
  if (!fsr || fsr.companyId !== companyId) throw notFoundError();
  if (!from.includes(fsr.status)) {
    throw businessRuleError(`Không thể ${action} yêu cầu dịch vụ ở trạng thái hiện tại`, {
      rule: "FIELD_SERVICE_INVALID_TRANSITION",
      currentStatus: fsr.status,
    });
  }
  return fsr;
}

export async function assignFieldServiceRequest(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "assign");

  const input = assignSchema.parse(await request.json());
  await transition(id, session.companyId, ["REQUESTED"], "ASSIGNED", "phân công");

  const technician = await prisma.employee.findUnique({ where: { id: input.technicianId } });
  if (!technician || technician.companyId !== session.companyId) throw validationError("Kỹ thuật viên không hợp lệ");

  const updated = await prisma.fieldServiceRequest.update({
    where: { id },
    data: { technicianId: input.technicianId, status: "ASSIGNED" },
    include,
  });
  return apiSuccess(updated);
}

export async function startFieldServiceRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "start");
  await transition(id, session.companyId, ["ASSIGNED"], "IN_PROGRESS", "bắt đầu");
  const updated = await prisma.fieldServiceRequest.update({ where: { id }, data: { status: "IN_PROGRESS" }, include });
  return apiSuccess(updated);
}

export async function completeFieldServiceRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "complete");
  await transition(id, session.companyId, ["IN_PROGRESS"], "COMPLETED", "hoàn tất");
  const updated = await prisma.fieldServiceRequest.update({ where: { id }, data: { status: "COMPLETED" }, include });
  return apiSuccess(updated);
}

export async function cancelFieldServiceRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "field-service-request", "cancel");
  await transition(id, session.companyId, ["REQUESTED", "ASSIGNED"], "CANCELLED", "hủy");
  const updated = await prisma.fieldServiceRequest.update({ where: { id }, data: { status: "CANCELLED" }, include });
  return apiSuccess(updated);
}
