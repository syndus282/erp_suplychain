import { z } from "zod";
import type { QuotationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "@/modules/procurement/lib/codegen";

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative().optional(),
  tax: z.number().int().nonnegative().optional(),
});

const createSchema = z.object({
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  salesRepId: z.string().nullable().optional(),
  validUntil: optionalDateInput(),
  lines: z.array(lineSchema).min(1, "Phải có ít nhất 1 dòng hàng"),
});

const include = {
  customer: true,
  lines: { include: { product: true } },
  salesOrders: { select: { id: true, code: true } },
};

function computeLineTotal(line: { unitPrice: number; qty: number; discount?: number; tax?: number }) {
  const discount = line.discount ?? 0;
  const tax = line.tax ?? 0;
  return Math.round(line.unitPrice * line.qty) - discount + tax;
}

export async function listQuotations(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.quotation.findMany({ where, orderBy, skip, take, include }),
    prisma.quotation.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

export async function createQuotation(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) {
    throw validationError("Khách hàng không hợp lệ");
  }

  const { lines, ...fields } = input;

  const created = await prisma.quotation.create({
    data: {
      ...fields,
      companyId: session.companyId,
      code: generateCode("QT"),
      status: "DRAFT",
      lines: {
        create: lines.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          discount: line.discount ?? 0,
          tax: line.tax ?? 0,
          totalAmount: computeLineTotal(line),
        })),
      },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

async function transitionQuotation(
  id: string,
  companyId: string,
  from: QuotationStatus[],
  to: QuotationStatus,
  action: string
) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation || quotation.companyId !== companyId) throw notFoundError();
  if (!from.includes(quotation.status)) {
    throw businessRuleError(`Không thể ${action} báo giá ở trạng thái hiện tại`, {
      rule: "QUOTATION_INVALID_TRANSITION",
      currentStatus: quotation.status,
    });
  }
  return prisma.quotation.update({ where: { id }, data: { status: to }, include });
}

export async function sendQuotation(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "send");
  const updated = await transitionQuotation(id, session.companyId, ["DRAFT"], "SENT", "gửi");
  return apiSuccess(updated);
}

export async function acceptQuotation(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "accept");
  const updated = await transitionQuotation(id, session.companyId, ["SENT"], "ACCEPTED", "chấp nhận");
  return apiSuccess(updated);
}

export async function rejectQuotation(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "reject");
  const updated = await transitionQuotation(id, session.companyId, ["SENT"], "REJECTED", "từ chối");
  return apiSuccess(updated);
}

export async function convertQuotationToSalesOrder(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "quotation", "convert");

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { lines: true, salesOrders: { select: { id: true } } },
  });
  if (!quotation || quotation.companyId !== session.companyId) throw notFoundError();
  if (quotation.status !== "ACCEPTED") {
    throw businessRuleError("Chỉ có thể tạo đơn hàng từ báo giá đã được khách hàng chấp nhận", {
      rule: "QUOTATION_NOT_ACCEPTED",
      currentStatus: quotation.status,
    });
  }
  if (quotation.salesOrders.length > 0) {
    throw businessRuleError("Báo giá này đã được chuyển thành đơn hàng", { rule: "QUOTATION_ALREADY_CONVERTED" });
  }

  const salesOrder = await prisma.salesOrder.create({
    data: {
      companyId: session.companyId,
      code: generateCode("SO"),
      quotationId: quotation.id,
      customerId: quotation.customerId,
      salesRepId: quotation.salesRepId,
      status: "DRAFT",
      lines: {
        create: quotation.lines.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          discount: line.discount,
          tax: line.tax,
          totalAmount: line.totalAmount,
        })),
      },
    },
    include: { lines: { include: { product: true } }, customer: true },
  });

  return apiSuccess(salesOrder, undefined, 201);
}
