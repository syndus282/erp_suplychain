import type { Prisma, PrismaClient } from "@prisma/client";
import { businessRuleError } from "@/lib/api/errors";
import { generateCode } from "@/modules/procurement/lib/codegen";

type Tx = PrismaClient | Prisma.TransactionClient;

interface PostingLine {
  accountCode: string;
  debit?: number;
  credit?: number;
}

/**
 * Tự động sinh bút toán cân đối (Nợ = Có) theo mã tài khoản chuẩn
 * (docs/business-spec/08 mục 4.1/11) — dùng khi AP/AR ghi nhận hóa đơn/thanh
 * toán. Không tìm thấy tài khoản nào trong danh sách thì chặn cứng (phải
 * thiết lập Hệ thống tài khoản trước khi dùng AP/AR), tránh bút toán "treo"
 * không có tài khoản đích.
 */
export async function postJournalEntry(
  tx: Tx,
  params: {
    companyId: string;
    refType: string;
    refId: string;
    description?: string;
    lines: PostingLine[];
  }
): Promise<void> {
  const totalDebit = params.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const totalCredit = params.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
  if (totalDebit !== totalCredit) {
    throw businessRuleError("Bút toán tự động không cân đối (Tổng Nợ khác Tổng Có)", {
      rule: "JOURNAL_ENTRY_UNBALANCED",
      totalDebit,
      totalCredit,
    });
  }

  const codes = [...new Set(params.lines.map((l) => l.accountCode))];
  const accounts = await tx.account.findMany({ where: { companyId: params.companyId, code: { in: codes } } });
  const accountByCode = new Map(accounts.map((a) => [a.code, a]));

  for (const code of codes) {
    if (!accountByCode.has(code)) {
      throw businessRuleError(`Chưa thiết lập tài khoản "${code}" trong Hệ thống tài khoản`, {
        rule: "ACCOUNT_NOT_FOUND",
        accountCode: code,
      });
    }
  }

  await tx.journalEntry.create({
    data: {
      companyId: params.companyId,
      code: generateCode("JE"),
      date: new Date(),
      refType: params.refType,
      refId: params.refId,
      description: params.description,
      status: "POSTED",
      lines: {
        create: params.lines.map((l) => ({
          accountId: accountByCode.get(l.accountCode)!.id,
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
        })),
      },
    },
  });
}
