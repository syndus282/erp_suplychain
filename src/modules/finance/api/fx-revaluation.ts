import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/errors";
import { postJournalEntry } from "../lib/posting";
import { convertToVnd } from "../lib/currency";

const revalueSchema = z.object({
  currency: z.string().min(1, "Phải chọn loại ngoại tệ cần đánh giá lại"),
  newExchangeRate: z.number().positive("Tỷ giá mới phải lớn hơn 0"),
});

/**
 * Đánh giá lại số dư ngoại tệ cuối kỳ (docs/currency-handling.md mục "FX
 * Revaluation cuối kỳ", docs/business-spec/08 mục 9) — chỉ áp dụng cho
 * SupplierInvoice CHƯA thanh toán hết (AR luôn VND, không có FX exposure).
 * Không đổi `exchangeRate` gốc trên từng hóa đơn (đó là tỷ giá ghi nhận ban
 * đầu, phải giữ nguyên để tính đúng chênh lệch thực tế lúc thanh toán sau
 * này) — chỉ ghi 1 bút toán điều chỉnh tổng hợp phản ánh chênh lệch tạm thời
 * tại thời điểm đánh giá.
 */
export async function revalueForeignCurrencyBalances(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "fx-revaluation", "revalue");

  const input = revalueSchema.parse(await request.json());

  const invoices = await prisma.supplierInvoice.findMany({
    where: { companyId: session.companyId, currency: input.currency, status: { in: ["PENDING", "PARTIALLY_PAID"] } },
  });

  if (invoices.length === 0) {
    throw validationError(`Không có hóa đơn mua hàng nào còn nợ bằng ${input.currency} để đánh giá lại`);
  }

  let totalDiff = 0;
  const detail = invoices.map((inv) => {
    const outstandingForeign = inv.amount - inv.paidAmount;
    const oldVnd = convertToVnd(outstandingForeign, inv.currency, inv.exchangeRate);
    const newVnd = convertToVnd(outstandingForeign, inv.currency, input.newExchangeRate);
    const diff = newVnd - oldVnd; // >0: lỗ chưa thực hiện, <0: lãi chưa thực hiện
    totalDiff += diff;
    return { invoiceCode: inv.code, outstandingForeign, oldVnd, newVnd, diff };
  });

  if (totalDiff !== 0) {
    await prisma.$transaction(async (tx) => {
      const lines =
        totalDiff > 0
          ? [
              { accountCode: "635", debit: totalDiff },
              { accountCode: "331", credit: totalDiff },
            ]
          : [
              { accountCode: "331", debit: -totalDiff },
              { accountCode: "515", credit: -totalDiff },
            ];

      await postJournalEntry(tx, {
        companyId: session.companyId,
        refType: "FxRevaluation",
        refId: `${input.currency}-${Date.now()}`,
        description: `Đánh giá lại số dư phải trả ${input.currency} theo tỷ giá mới ${input.newExchangeRate}`,
        lines,
      });
    });
  }

  return apiSuccess({ currency: input.currency, newExchangeRate: input.newExchangeRate, totalDiff, detail });
}
