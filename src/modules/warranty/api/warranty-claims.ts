import { z } from "zod";
import type { WarrantyClaimStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { recordStockMovement } from "@/modules/inventory/lib/stock-ledger";
import { generateCode } from "@/modules/procurement/lib/codegen";

const createSchema = z.object({
  registrationId: z.string().min(1, "Phải chọn đăng ký bảo hành"),
  description: z.string().optional(),
  attachmentUrls: z.string().optional(),
});

const replaceSchema = z.object({
  newSerialId: z.string().min(1, "Phải chọn serial hàng thay thế"),
  warehouseId: z.string().min(1, "Phải chọn kho xuất hàng thay thế"),
});

const include = {
  registration: { include: { product: true, serial: true } },
  customer: true,
  rmaRequests: true,
  repairOrders: true,
};

export async function listWarrantyClaims(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.warrantyClaim.findMany({ where, orderBy, skip, take, include }),
    prisma.warrantyClaim.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createWarrantyClaim(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "create");

  const input = createSchema.parse(await request.json());

  const registration = await prisma.warrantyRegistration.findUnique({ where: { id: input.registrationId } });
  if (!registration || registration.companyId !== session.companyId) {
    throw validationError("Đăng ký bảo hành không hợp lệ");
  }
  if (registration.warrantyEnd < new Date()) {
    throw businessRuleError("Sản phẩm này đã hết hạn bảo hành", { rule: "WARRANTY_EXPIRED", warrantyEnd: registration.warrantyEnd });
  }

  const created = await prisma.warrantyClaim.create({
    data: {
      companyId: session.companyId,
      code: generateCode("WC"),
      registrationId: input.registrationId,
      customerId: registration.customerId,
      description: input.description,
      attachmentUrls: input.attachmentUrls,
      status: "OPEN",
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

async function transitionClaim(id: string, companyId: string, from: WarrantyClaimStatus[], to: WarrantyClaimStatus, action: string) {
  const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
  if (!claim || claim.companyId !== companyId) throw notFoundError();
  if (!from.includes(claim.status)) {
    throw businessRuleError(`Không thể ${action} yêu cầu bảo hành ở trạng thái hiện tại`, {
      rule: "WARRANTY_CLAIM_INVALID_TRANSITION",
      currentStatus: claim.status,
    });
  }
  return prisma.warrantyClaim.update({ where: { id }, data: { status: to }, include });
}

export async function inspectWarrantyClaim(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "inspect");
  return apiSuccess(await transitionClaim(id, session.companyId, ["OPEN"], "INSPECTING", "kiểm tra"));
}

export async function approveWarrantyClaim(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "approve");
  return apiSuccess(await transitionClaim(id, session.companyId, ["INSPECTING"], "APPROVED", "duyệt"));
}

export async function rejectWarrantyClaim(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "reject");
  return apiSuccess(await transitionClaim(id, session.companyId, ["INSPECTING"], "REJECTED", "từ chối"));
}

export async function repairWarrantyClaim(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "repair");

  const body = (await request.json().catch(() => ({}))) as { technicianId?: string };

  const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
  if (!claim || claim.companyId !== session.companyId) throw notFoundError();
  if (claim.status !== "APPROVED") {
    throw businessRuleError("Chỉ có thể tạo lệnh sửa chữa cho yêu cầu bảo hành đã Duyệt", {
      rule: "WARRANTY_CLAIM_NOT_APPROVED",
      currentStatus: claim.status,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.repairOrder.create({
      data: { companyId: session.companyId, claimId: id, technicianId: body.technicianId, status: "RECEIVED" },
    });
    return tx.warrantyClaim.update({ where: { id }, data: { status: "REPAIRING" }, include });
  });

  return apiSuccess(updated);
}

/**
 * Đổi hàng mới cho khách (docs/business-spec/07 mục 12) — xuất kho serial
 * mới (WARRANTY_OUT), đánh dấu serial mới đã bán cho khách, đánh dấu serial
 * cũ (nếu có quản lý serial) là DEFECTIVE chờ thu hồi qua RMA riêng.
 */
export async function replaceWarrantyClaim(request: Request, id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "replace");

  const input = replaceSchema.parse(await request.json());

  const claim = await prisma.warrantyClaim.findUnique({ where: { id }, include: { registration: true } });
  if (!claim || claim.companyId !== session.companyId) throw notFoundError();
  if (claim.status !== "APPROVED") {
    throw businessRuleError("Chỉ có thể đổi hàng mới cho yêu cầu bảo hành đã Duyệt", {
      rule: "WARRANTY_CLAIM_NOT_APPROVED",
      currentStatus: claim.status,
    });
  }

  const newSerial = await prisma.serialNumber.findUnique({ where: { id: input.newSerialId } });
  if (!newSerial || newSerial.companyId !== session.companyId || newSerial.status !== "IN_STOCK") {
    throw validationError("Serial hàng thay thế không hợp lệ hoặc không còn trong kho");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await recordStockMovement(tx, {
      companyId: session.companyId,
      warehouseId: input.warehouseId,
      productId: claim.registration.productId,
      serialId: newSerial.id,
      type: "WARRANTY_OUT",
      qty: -1,
      refType: "WarrantyClaim",
      refId: claim.id,
    });

    await tx.serialNumber.update({
      where: { id: newSerial.id },
      data: { status: "SOLD", currentOwnerCustomerId: claim.customerId },
    });

    if (claim.registration.serialId) {
      await tx.serialNumber.update({ where: { id: claim.registration.serialId }, data: { status: "DEFECTIVE" } });
    }

    return tx.warrantyClaim.update({ where: { id }, data: { status: "REPLACED" }, include });
  });

  return apiSuccess(updated);
}

export async function closeWarrantyClaim(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "warranty-claim", "close");
  return apiSuccess(await transitionClaim(id, session.companyId, ["REPAIRING", "REPLACED"], "CLOSED", "đóng"));
}
