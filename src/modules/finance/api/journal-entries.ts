import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";
import { generateCode } from "@/modules/procurement/lib/codegen";

const lineSchema = z.object({
  accountId: z.string().min(1),
  debit: z.number().int().nonnegative().optional(),
  credit: z.number().int().nonnegative().optional(),
  costCenterId: z.string().nullable().optional(),
});

const createSchema = z.object({
  date: optionalDateInput(),
  description: z.string().optional(),
  lines: z.array(lineSchema).min(2, "Bút toán phải có ít nhất 2 dòng (Nợ/Có)"),
});

const include = { lines: { include: { account: true, costCenter: true } } };

export async function listJournalEntries(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "journal-entry", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "date", "createdAt"]);

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.journalEntry.findMany({ where, orderBy, skip, take, include }),
    prisma.journalEntry.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/** Bút toán thủ công (điều chỉnh/phân bổ) — docs/business-spec/08 mục 6-7: tạo ở Draft, phải Nợ=Có mới cho Post. */
export async function createJournalEntry(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "journal-entry", "create");

  const input = createSchema.parse(await request.json());

  const totalDebit = input.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const totalCredit = input.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
  if (totalDebit !== totalCredit) {
    throw validationError("Bút toán không cân đối: Tổng Nợ phải bằng Tổng Có");
  }
  if (totalDebit === 0) {
    throw validationError("Bút toán phải có giá trị lớn hơn 0");
  }

  const accountIds = input.lines.map((l) => l.accountId);
  const accounts = await prisma.account.findMany({ where: { id: { in: accountIds }, companyId: session.companyId } });
  if (accounts.length !== new Set(accountIds).size) {
    throw validationError("Có tài khoản không hợp lệ");
  }

  const created = await prisma.journalEntry.create({
    data: {
      companyId: session.companyId,
      code: generateCode("JE"),
      date: input.date ?? new Date(),
      description: input.description,
      status: "DRAFT",
      lines: {
        create: input.lines.map((l) => ({
          accountId: l.accountId,
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
          costCenterId: l.costCenterId ?? undefined,
        })),
      },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}

export async function postJournalEntryAction(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "journal-entry", "post");

  const entry = await prisma.journalEntry.findUnique({ where: { id }, include: { lines: true } });
  if (!entry || entry.companyId !== session.companyId) throw notFoundError();
  if (entry.status !== "DRAFT") {
    throw businessRuleError("Chỉ có thể ghi sổ bút toán đang ở trạng thái Nháp", {
      rule: "JOURNAL_ENTRY_NOT_DRAFT",
      currentStatus: entry.status,
    });
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  if (totalDebit !== totalCredit) {
    throw businessRuleError("Bút toán không cân đối, không thể ghi sổ", { rule: "JOURNAL_ENTRY_UNBALANCED" });
  }

  const updated = await prisma.journalEntry.update({ where: { id }, data: { status: "POSTED" }, include });
  return apiSuccess(updated);
}

/** Khóa sổ — sau khi khóa KHÔNG thể sửa/xóa chứng từ (docs/business-spec/08 mục 7). */
export async function lockJournalEntryAction(id: string) {
  const session = await getCurrentSession();
  requirePermission(session, "journal-entry", "lock");

  const entry = await prisma.journalEntry.findUnique({ where: { id } });
  if (!entry || entry.companyId !== session.companyId) throw notFoundError();
  if (entry.status !== "POSTED") {
    throw businessRuleError("Chỉ có thể khóa sổ bút toán đã ghi sổ (Posted)", {
      rule: "JOURNAL_ENTRY_NOT_POSTED",
      currentStatus: entry.status,
    });
  }

  const updated = await prisma.journalEntry.update({ where: { id }, data: { status: "LOCKED" }, include });
  return apiSuccess(updated);
}
