import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { createApprovalRequest } from "@/modules/workflow/lib/approval";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "../lib/codegen";

const lineSchema = z.object({
  productId: z.string().min(1),
  uomId: z.string().optional(),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  estimatedPrice: z.number().int().nonnegative(),
  currency: z.string().optional(),
  neededDate: optionalDateInput(),
});

const createSchema = z.object({
  departmentId: z.string().nullable().optional(),
  warehouseId: z.string().nullable().optional(),
  reason: z.string().optional(),
  priority: z.string().optional(),
  approverUserId: z.string().min(1, "Phải chọn người duyệt"),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const include = {
  department: true,
  warehouse: true,
  lines: { include: { product: true } },
};

export async function listPurchaseRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "purchase-request", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.purchaseRequest.findMany({ where, orderBy, skip, take, include }),
    prisma.purchaseRequest.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createPurchaseRequest(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "purchase-request", "create");

  if (!session.employeeId) {
    throw businessRuleError(
      "Tài khoản của bạn chưa gắn với hồ sơ nhân viên nên không thể tạo đề nghị mua hàng",
      { rule: "USER_NOT_LINKED_TO_EMPLOYEE" }
    );
  }

  const input = createSchema.parse(await request.json());

  const approver = await prisma.user.findUnique({ where: { id: input.approverUserId } });
  if (!approver || approver.companyId !== session.companyId) {
    throw validationError("Người duyệt không hợp lệ");
  }

  const { lines, approverUserId, ...prFields } = input;

  const created = await prisma.$transaction(async (tx) => {
    const pr = await tx.purchaseRequest.create({
      data: {
        ...prFields,
        companyId: session.companyId,
        code: generateCode("PR"),
        requestedById: session.employeeId!,
        status: "PENDING_APPROVAL",
        lines: {
          create: lines.map((line) => ({
            productId: line.productId,
            uomId: line.uomId,
            qty: line.qty,
            estimatedPrice: line.estimatedPrice,
            currency: line.currency ?? "VND",
            neededDate: line.neededDate,
          })),
        },
      },
      include,
    });

    await createApprovalRequest(
      {
        companyId: session.companyId,
        entityType: "PurchaseRequest",
        entityId: pr.id,
        requestedById: session.sub,
        approverUserId,
      },
      tx
    );

    return pr;
  });

  return apiSuccess(created, undefined, 201);
}
