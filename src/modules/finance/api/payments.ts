import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { generateCode } from "@/modules/procurement/lib/codegen";
import { postJournalEntry } from "../lib/posting";
import { convertToVnd } from "../lib/currency";

const createSchema = z.object({
  direction: z.enum(["IN", "OUT"]),
  invoiceId: z.string().min(1, "Phải chọn hóa đơn"),
  amount: z.number().int().positive("Số tiền phải lớn hơn 0"),
  exchangeRate: z.number().positive().optional(),
  method: z.string().optional(),
  bankAccountId: z.string().nullable().optional(),
});

const include = { bankAccount: true };

export async function listPayments(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "payment", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "paidAt"], { paidAt: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.payment.findMany({ where, orderBy, skip, take, include }),
    prisma.payment.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Thu/Chi tiền — chỉ hỗ trợ 2 luồng phổ biến nhất (docs/business-spec/08 mục
 * 8/13/15): OUT thanh toán SupplierInvoice (AP) và IN thu tiền CustomerInvoice
 * (AR). Chi cho NCC/Thu từ KH theo chiều ngược lại (hoàn tiền) để lại vì hiếm
 * gặp và cần thiết kế riêng.
 */
export async function createPayment(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "payment", "create");

  const input = createSchema.parse(await request.json());

  if (input.bankAccountId) {
    const bankAccount = await prisma.bankAccount.findUnique({ where: { id: input.bankAccountId } });
    if (!bankAccount || bankAccount.companyId !== session.companyId) throw validationError("Tài khoản ngân hàng không hợp lệ");
  }
  const cashAccountCode = input.bankAccountId ? "112" : "111";

  if (input.direction === "OUT") {
    return apiSuccess(await createApPayment(session.companyId, input, cashAccountCode), undefined, 201);
  }
  return apiSuccess(await createArPayment(session.companyId, input, cashAccountCode), undefined, 201);
}

async function createApPayment(
  companyId: string,
  input: z.infer<typeof createSchema>,
  cashAccountCode: string
) {
  const invoice = await prisma.supplierInvoice.findUnique({ where: { id: input.invoiceId } });
  if (!invoice || invoice.companyId !== companyId) throw validationError("Hóa đơn mua hàng không hợp lệ");
  if (invoice.status === "PAID") {
    throw businessRuleError("Hóa đơn này đã được thanh toán đủ", { rule: "SUPPLIER_INVOICE_ALREADY_PAID" });
  }

  const remaining = invoice.amount - invoice.paidAmount;
  if (input.amount > remaining) {
    throw businessRuleError("Số tiền thanh toán vượt quá số tiền còn phải trả", {
      rule: "PAYMENT_EXCEEDS_REMAINING",
      remaining,
      requested: input.amount,
    });
  }

  const paymentExchangeRate = input.exchangeRate ?? invoice.exchangeRate;
  const amountVndAtInvoiceRate = convertToVnd(input.amount, invoice.currency, invoice.exchangeRate);
  const amountVndAtPaymentRate = convertToVnd(input.amount, invoice.currency, paymentExchangeRate);
  const fxDiff = amountVndAtPaymentRate - amountVndAtInvoiceRate; // >0: lỗ tỷ giá, <0: lãi tỷ giá

  return prisma.$transaction(async (tx) => {
    const newPaidAmount = invoice.paidAmount + input.amount;
    await tx.supplierInvoice.update({
      where: { id: invoice.id },
      data: { paidAmount: newPaidAmount, status: newPaidAmount >= invoice.amount ? "PAID" : "PARTIALLY_PAID" },
    });

    const payment = await tx.payment.create({
      data: {
        companyId,
        code: generateCode("PAY"),
        direction: "OUT",
        partnerType: "SUPPLIER",
        partnerId: invoice.supplierId,
        amount: input.amount,
        currency: invoice.currency,
        exchangeRate: paymentExchangeRate,
        method: input.method,
        bankAccountId: input.bankAccountId ?? undefined,
        refType: "SupplierInvoice",
        refId: invoice.id,
      },
      include,
    });

    const lines = [
      { accountCode: "331", debit: amountVndAtInvoiceRate },
      { accountCode: cashAccountCode, credit: amountVndAtPaymentRate },
    ];
    if (fxDiff > 0) lines.push({ accountCode: "635", debit: fxDiff });
    if (fxDiff < 0) lines.push({ accountCode: "515", credit: -fxDiff });

    await postJournalEntry(tx, {
      companyId,
      refType: "Payment",
      refId: payment.id,
      description: `Thanh toán hóa đơn mua hàng ${invoice.code}`,
      lines,
    });

    return payment;
  });
}

async function createArPayment(
  companyId: string,
  input: z.infer<typeof createSchema>,
  cashAccountCode: string
) {
  const invoice = await prisma.customerInvoice.findUnique({ where: { id: input.invoiceId } });
  if (!invoice || invoice.companyId !== companyId) throw validationError("Hóa đơn bán hàng không hợp lệ");
  if (invoice.status === "PAID") {
    throw businessRuleError("Hóa đơn này đã được thu đủ tiền", { rule: "CUSTOMER_INVOICE_ALREADY_PAID" });
  }

  const remaining = invoice.amount - invoice.paidAmount;
  if (input.amount > remaining) {
    throw businessRuleError("Số tiền thu vượt quá số tiền còn phải thu", {
      rule: "PAYMENT_EXCEEDS_REMAINING",
      remaining,
      requested: input.amount,
    });
  }

  return prisma.$transaction(async (tx) => {
    const newPaidAmount = invoice.paidAmount + input.amount;
    await tx.customerInvoice.update({
      where: { id: invoice.id },
      data: { paidAmount: newPaidAmount, status: newPaidAmount >= invoice.amount ? "PAID" : "PARTIALLY_PAID" },
    });

    const customer = await tx.customer.findUnique({ where: { id: invoice.customerId } });
    if (customer) {
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { currentDebt: Math.max(0, customer.currentDebt - input.amount) },
      });
    }

    const payment = await tx.payment.create({
      data: {
        companyId,
        code: generateCode("PAY"),
        direction: "IN",
        partnerType: "CUSTOMER",
        partnerId: invoice.customerId,
        amount: input.amount,
        currency: invoice.currency,
        method: input.method,
        bankAccountId: input.bankAccountId ?? undefined,
        refType: "CustomerInvoice",
        refId: invoice.id,
      },
      include,
    });

    await postJournalEntry(tx, {
      companyId,
      refType: "Payment",
      refId: payment.id,
      description: `Thu tiền hóa đơn bán hàng ${invoice.code}`,
      lines: [
        { accountCode: cashAccountCode, debit: input.amount },
        { accountCode: "131", credit: input.amount },
      ],
    });

    return payment;
  });
}
