import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "@/modules/procurement/lib/codegen";
import { postJournalEntry } from "../lib/posting";

const createSchema = z.object({
  customerId: z.string().min(1, "Phải chọn khách hàng"),
  soId: z.string().nullable().optional(),
  amount: z.number().int().positive("Số tiền phải lớn hơn 0"),
  dueDate: optionalDateInput(),
});

// CustomerInvoice không có field exchangeRate trong schema (khách hàng nội
// địa, hóa đơn luôn VND) — khác SupplierInvoice có thể là ngoại tệ. Vì vậy
// AR không có FX exposure, chỉ AP mới cần đánh giá lại tỷ giá (mục "Còn thiếu").
const include = { customer: true, salesOrder: { select: { id: true, code: true } } };

export async function listCustomerInvoices(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "customer-invoice", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.customerInvoice.findMany({ where, orderBy, skip, take, include }),
    prisma.customerInvoice.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Ghi nhận hóa đơn bán hàng (Accounts Receivable) — ghi nhận doanh thu (Nợ
 * 131/Có 511) và cộng vào `Customer.currentDebt` (nối lại vòng lặp Credit
 * Control của Phase 5: SalesOrder.confirm() kiểm tra currentDebt, nhưng chỉ
 * CustomerInvoice mới thực sự phát sinh công nợ — trước Phase 8, currentDebt
 * không có nguồn nào cập nhật).
 */
export async function createCustomerInvoice(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "customer-invoice", "create");

  const input = createSchema.parse(await request.json());

  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer || customer.companyId !== session.companyId) throw validationError("Khách hàng không hợp lệ");

  if (input.soId) {
    const so = await prisma.salesOrder.findUnique({ where: { id: input.soId } });
    if (!so || so.companyId !== session.companyId) throw validationError("Đơn hàng bán không hợp lệ");
  }

  const created = await prisma.$transaction(async (tx) => {
    const invoice = await tx.customerInvoice.create({
      data: {
        companyId: session.companyId,
        code: generateCode("CINV"),
        customerId: input.customerId,
        soId: input.soId ?? undefined,
        amount: input.amount,
        dueDate: input.dueDate,
        status: "PENDING",
      },
      include,
    });

    await tx.customer.update({
      where: { id: input.customerId },
      data: { currentDebt: customer.currentDebt + input.amount },
    });

    await postJournalEntry(tx, {
      companyId: session.companyId,
      refType: "CustomerInvoice",
      refId: invoice.id,
      description: `Ghi nhận hóa đơn bán hàng ${invoice.code}`,
      lines: [
        { accountCode: "131", debit: input.amount },
        { accountCode: "511", credit: input.amount },
      ],
    });

    return invoice;
  });

  return apiSuccess(created, undefined, 201);
}
