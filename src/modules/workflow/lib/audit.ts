import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

/**
 * Ghi AuditLog (docs/business-spec/12 mục 30: ai tạo/sửa/duyệt, giá trị
 * trước/sau). `oldValue`/`newValue` lưu dạng JSON string vì AuditLog là bảng
 * dùng chung cho mọi entityType, không thể có schema cột cố định theo từng
 * loại entity.
 */
export async function writeAuditLog(
  params: {
    companyId: string;
    entityType: string;
    entityId: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";
    changedById?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
  },
  client: PrismaClientOrTx = prisma
) {
  return client.auditLog.create({
    data: {
      companyId: params.companyId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changedById: params.changedById ?? undefined,
      oldValue: params.oldValue !== undefined ? JSON.stringify(params.oldValue) : undefined,
      newValue: params.newValue !== undefined ? JSON.stringify(params.newValue) : undefined,
    },
  });
}
