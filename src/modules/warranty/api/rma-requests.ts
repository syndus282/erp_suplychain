import { z } from "zod";
import type { RmaStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

const createSchema = z
  .object({
    claimId: z.string().nullable().optional(),
    salesReturnId: z.string().nullable().optional(),
  })
  .refine((v) => v.claimId || v.salesReturnId, { message: "Phải chọn Yêu cầu bảo hành hoặc Phiếu trả hàng nguồn" });

const receiveSchema = z.object({
  warehouseId: z.string().min(1, "Phải chọn kho nhận hàng trả"),
});

const include = {
  claim: { include: { registration: { include: { product: true, serial: true } } } },
  salesReturn: { include: { lines: { include: { product: true } } } },
};

async function resolveProductAndSerial(rma: { claimId: string | null; salesReturnId: string | null }, companyId: string) {
  if (rma.claimId) {
    const claim = await prisma.warrantyClaim.findUnique({ where: { id: rma.claimId }, include: { registration: true } });
    if (!claim || claim.companyId !== companyId) throw notFoundError();
    return { productId: claim.registration.productId, serialId: claim.registration.serialId };
  }
  const salesReturn = await prisma.salesReturn.findUnique({ where: { id: rma.salesReturnId! }, include: { lines: true } });
  if (!salesReturn || salesReturn.companyId !== companyId || salesReturn.lines.length === 0) throw notFoundError();
  return { productId: salesReturn.lines[0].productId, serialId: salesReturn.lines[0].serialId };
}

export async function listRmaRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.rmaRequest.findMany({ where, orderBy, skip, take, include }),
    prisma.rmaRequest.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createRmaRequest(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "create");

  const input = createSchema.parse(await request.json());

  if (input.claimId) {
    const claim = await prisma.warrantyClaim.findUnique({ where: { id: input.claimId } });
    if (!claim || claim.companyId !== session.companyId) throw validationError("Yêu cầu bảo hành không hợp lệ");
  }
  if (input.salesReturnId) {
    const salesReturn = await prisma.salesReturn.findUnique({ where: { id: input.salesReturnId } });
    if (!salesReturn || salesReturn.companyId !== session.companyId) throw validationError("Phiếu trả hàng không hợp lệ");
  }

  const created = await prisma.rmaRequest.create({
    data: {
      companyId: session.companyId,
      code: generateCode("RMA"),
      claimId: input.claimId ?? undefined,
      salesReturnId: input.salesReturnId ?? undefined,
      status: "REQUESTED",
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

async function transitionRma(id: string, companyId: string, from: RmaStatus[], to: RmaStatus, action: string) {
  const rma = await prisma.rmaRequest.findUnique({ where: { id } });
  if (!rma || rma.companyId !== companyId) throw notFoundError();
  if (!from.includes(rma.status)) {
    throw businessRuleError(`Không thể ${action} RMA ở trạng thái hiện tại`, {
      rule: "RMA_INVALID_TRANSITION",
      currentStatus: rma.status,
    });
  }
  return rma;
}

export async function approveRmaRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "approve");
  await transitionRma(id, session.companyId, ["REQUESTED"], "APPROVED", "duyệt");
  const updated = await prisma.rmaRequest.update({ where: { id }, data: { status: "APPROVED" }, include });
  return apiSuccess(updated);
}

export async function rejectRmaRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "reject");
  await transitionRma(id, session.companyId, ["REQUESTED"], "REJECTED", "từ chối");
  const updated = await prisma.rmaRequest.update({ where: { id }, data: { status: "REJECTED" }, include });
  return apiSuccess(updated);
}

export async function receiveRmaRequest(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "receive");

  const input = receiveSchema.parse(await request.json());
  const rma = await transitionRma(id, session.companyId, ["APPROVED"], "RECEIVED", "nhận hàng");

  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse || warehouse.companyId !== session.companyId) throw validationError("Kho không hợp lệ");

  const { productId, serialId } = await resolveProductAndSerial(rma, session.companyId);

  const updated = await prisma.$transaction(async (tx) => {
    await recordStockMovement(tx, {
      companyId: session.companyId,
      warehouseId: input.warehouseId,
      productId,
      serialId,
      type: "WARRANTY_IN",
      qty: 1,
      refType: "RmaRequest",
      refId: rma.id,
    });
    if (serialId) {
      await tx.serialNumber.update({ where: { id: serialId }, data: { status: "RETURNED", warehouseId: input.warehouseId } });
    }
    return tx.rmaRequest.update({ where: { id }, data: { status: "RECEIVED" }, include });
  });

  return apiSuccess(updated);
}

export async function qcRmaRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "qc");
  await transitionRma(id, session.companyId, ["RECEIVED"], "QC_DONE", "kiểm tra chất lượng");
  const updated = await prisma.rmaRequest.update({ where: { id }, data: { status: "QC_DONE" }, include });
  return apiSuccess(updated);
}

export async function repairedRmaRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "repair");
  await transitionRma(id, session.companyId, ["QC_DONE"], "REPAIRED", "sửa chữa");
  const updated = await prisma.rmaRequest.update({ where: { id }, data: { status: "REPAIRED" }, include });
  return apiSuccess(updated);
}

export async function replacedRmaRequest(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "rma-request", "replace");
  await transitionRma(id, session.companyId, ["QC_DONE"], "REPLACED", "đổi hàng");
  const updated = await prisma.rmaRequest.update({ where: { id }, data: { status: "REPLACED" }, include });
  return apiSuccess(updated);
}
