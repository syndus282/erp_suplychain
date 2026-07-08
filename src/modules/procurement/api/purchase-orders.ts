import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "../lib/codegen";
import { convertToVnd } from "@/modules/finance/lib/currency";
import { resolveApprover } from "@/modules/workflow/lib/approval-matrix";
import { createApprovalRequest } from "@/modules/workflow/lib/approval";

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative().optional(),
  tax: z.number().int().nonnegative().optional(),
});

const createSchema = z.object({
  prId: z.string().min(1, "Phải chọn đề nghị mua hàng đã duyệt"),
  supplierId: z.string().min(1, "Phải chọn nhà cung cấp"),
  entrustedImportUnitId: z.string().nullable().optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  paymentTerm: z.string().optional(),
  incoterm: z.string().optional(),
  expectedDeliveryDate: optionalDateInput(),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const include = {
  supplier: true,
  entrustedImportUnit: true,
  purchaseRequest: true,
  lines: { include: { product: true } },
};

export async function listPurchaseOrders(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "purchase-order", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.purchaseOrder.findMany({ where, orderBy, skip, take, include }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createPurchaseOrder(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "purchase-order", "create");

  const input = createSchema.parse(await request.json());

  // Quy tắc bắt buộc (docs/business-spec/02): không tạo PO nếu PR chưa duyệt.
  const pr = await prisma.purchaseRequest.findUnique({ where: { id: input.prId } });
  if (!pr || pr.companyId !== session.companyId) {
    throw businessRuleError("Đề nghị mua hàng không hợp lệ", { rule: "PR_NOT_FOUND" });
  }
  if (pr.status !== "APPROVED") {
    throw businessRuleError("Không thể tạo đơn mua hàng vì đề nghị mua hàng chưa được duyệt", {
      rule: "PR_NOT_APPROVED",
      prStatus: pr.status,
    });
  }

  const { lines, ...poFields } = input;

  const created = await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        ...poFields,
        companyId: session.companyId,
        code: generateCode("PO"),
        currency: poFields.currency ?? "VND",
        exchangeRate: poFields.exchangeRate ?? 1,
        status: "DRAFT",
        lines: {
          create: lines.map((line) => {
            const discount = line.discount ?? 0;
            const tax = line.tax ?? 0;
            const totalAmount = Math.round(line.unitPrice * line.qty) - discount + tax;
            return {
              productId: line.productId,
              qty: line.qty,
              unitPrice: line.unitPrice,
              discount,
              tax,
              totalAmount,
              qtyReceived: 0,
              qtyRemaining: line.qty,
            };
          }),
        },
      },
      include,
    });

    await tx.purchaseRequest.update({ where: { id: pr.id }, data: { status: "CONVERTED" } });

    return po;
  });

  return apiSuccess(created, undefined, 201);
}

/**
 * Trình duyệt PO qua workflow đầy đủ (Phase 10 - docs/business-spec/12 mục 6):
 * tra ApprovalMatrix theo giá trị PO (quy đổi VND) để tìm role duyệt, rồi tạo
 * ApprovalRequest — quyết định duyệt/từ chối thực hiện qua hộp thư duyệt
 * chung (`/approvals`, xem approval.ts#decideApprovalStep), KHÔNG còn action
 * approve permission-gated đơn giản như Phase 2.
 */
export async function submitPurchaseOrderForApproval(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "purchase-order", "submit");

  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { lines: true } });
  if (!po || po.companyId !== session.companyId) throw notFoundError();
  if (po.status !== "DRAFT") {
    throw businessRuleError("Chỉ có thể trình duyệt đơn mua hàng đang ở trạng thái Nháp", {
      rule: "PO_NOT_DRAFT",
      currentStatus: po.status,
    });
  }

  const totalAmount = po.lines.reduce((sum, line) => sum + line.totalAmount, 0);
  const amountVnd = convertToVnd(totalAmount, po.currency, po.exchangeRate);
  const { approverRoleId } = await resolveApprover(session.companyId, "PurchaseOrder", amountVnd);

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.purchaseOrder.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
      include,
    });
    await createApprovalRequest(
      {
        companyId: session.companyId,
        entityType: "PurchaseOrder",
        entityId: id,
        requestedById: session.sub,
        approverRoleId,
        notificationTitle: `Yêu cầu duyệt đơn mua hàng ${po.code} (${amountVnd.toLocaleString("vi-VN")} VND)`,
      },
      tx
    );
    return result;
  });

  return apiSuccess(updated);
}
