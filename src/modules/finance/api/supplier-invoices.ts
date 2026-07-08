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
import { convertToVnd } from "../lib/currency";

const createSchema = z.object({
  supplierId: z.string().min(1, "Phải chọn nhà cung cấp"),
  poId: z.string().nullable().optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  amount: z.number().int().positive("Số tiền phải lớn hơn 0"),
  dueDate: optionalDateInput(),
});

// SupplierInvoice.poId là field thường (không có relation Prisma tới PurchaseOrder
// trong schema) — validate thủ công ở createSupplierInvoice, không include ở đây.
const include = { supplier: true };

export async function listSupplierInvoices(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "supplier-invoice", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.supplierInvoice.findMany({ where, orderBy, skip, take, include }),
    prisma.supplierInvoice.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Ghi nhận hóa đơn mua hàng (Accounts Payable) — đồng thời là điểm ghi nhận
 * giá trị hàng nhập kho về mặt kế toán (docs/business-spec/08 mục 11: Nhập
 * kho → Nợ 156/Có 331). Không hook trực tiếp vào GoodsReceipt (Phase 2) vì
 * giá vốn thực tế chỉ chốt sau khi phân bổ Landed Cost — SupplierInvoice là
 * chứng từ kế toán tương ứng, tách biệt với chứng từ kho.
 */
export async function createSupplierInvoice(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "supplier-invoice", "create");

  const input = createSchema.parse(await request.json());

  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier || supplier.companyId !== session.companyId) throw validationError("Nhà cung cấp không hợp lệ");

  if (input.poId) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: input.poId } });
    if (!po || po.companyId !== session.companyId) throw validationError("Đơn mua hàng không hợp lệ");
  }

  const currency = input.currency ?? "VND";
  const exchangeRate = input.exchangeRate ?? 1;
  const amountVnd = convertToVnd(input.amount, currency, exchangeRate);

  const created = await prisma.$transaction(async (tx) => {
    const invoice = await tx.supplierInvoice.create({
      data: {
        companyId: session.companyId,
        code: generateCode("SINV"),
        supplierId: input.supplierId,
        poId: input.poId ?? undefined,
        currency,
        exchangeRate,
        amount: input.amount,
        dueDate: input.dueDate,
        status: "PENDING",
      },
      include,
    });

    await postJournalEntry(tx, {
      companyId: session.companyId,
      refType: "SupplierInvoice",
      refId: invoice.id,
      description: `Ghi nhận hóa đơn mua hàng ${invoice.code}`,
      lines: [
        { accountCode: "156", debit: amountVnd },
        { accountCode: "331", credit: amountVnd },
      ],
    });

    return invoice;
  });

  return apiSuccess(created, undefined, 201);
}
