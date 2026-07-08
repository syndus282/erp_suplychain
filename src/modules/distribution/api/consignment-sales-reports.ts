import { z } from "zod";
import { ConsignmentSalesSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { optionalDateInput } from "@/lib/api/validation";

const createSchema = z.object({
  dealerId: z.string().min(1, "Phải chọn đại lý"),
  productId: z.string().min(1, "Phải chọn sản phẩm"),
  qtySold: z.number().positive("Số lượng bán phải lớn hơn 0"),
  endCustomerName: z.string().optional(),
  soldAt: optionalDateInput(),
  unitPrice: z.number().int().nonnegative(),
  currency: z.string().optional(),
  source: z.nativeEnum(ConsignmentSalesSource).optional(),
});

const include = { dealer: true, product: true };

export async function listConsignmentSalesReports(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-sales-report", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["reportedAt", "createdAt"]);
  const dealerId = url.searchParams.get("dealerId");

  const where = { companyId: session.companyId, ...(dealerId ? { dealerId } : {}) };
  const [items, totalItems] = await Promise.all([
    prisma.consignmentSalesReport.findMany({ where, orderBy, skip, take, include }),
    prisma.consignmentSalesReport.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Ghi nhận đại lý báo cáo bán hàng ký gửi. Chỉ cập nhật ConsignmentBalance ở
 * Phase 4 — chuỗi side-effect đầy đủ (tạo hóa đơn/công nợ/hoa hồng, theo
 * docs/data-model.md mục 16.4) thuộc Sales (Phase 5) / Finance (Phase 8) /
 * HRM (Phase 9), CHƯA làm ở đây.
 */
export async function createConsignmentSalesReport(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "consignment-sales-report", "create");

  const input = createSchema.parse(await request.json());

  const dealer = await prisma.customer.findUnique({ where: { id: input.dealerId } });
  if (!dealer || dealer.companyId !== session.companyId || dealer.type !== "DEALER") {
    throw validationError("Đại lý không hợp lệ");
  }

  const balance = await prisma.consignmentBalance.findFirst({
    where: { dealerId: input.dealerId, productId: input.productId, serialId: null },
  });
  if (!balance || balance.qtyOnHand < input.qtySold) {
    throw businessRuleError(
      `Đại lý chỉ còn ${balance?.qtyOnHand ?? 0} sản phẩm ký gửi, không đủ để báo bán ${input.qtySold}`,
      { rule: "CONSIGNMENT_QTY_EXCEEDED", available: balance?.qtyOnHand ?? 0 }
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const report = await tx.consignmentSalesReport.create({
      data: {
        companyId: session.companyId,
        dealerId: input.dealerId,
        productId: input.productId,
        qtySold: input.qtySold,
        endCustomerName: input.endCustomerName,
        soldAt: input.soldAt ?? new Date(),
        unitPrice: input.unitPrice,
        currency: input.currency ?? "VND",
        source: input.source ?? "PORTAL",
      },
      include,
    });

    await tx.consignmentBalance.update({
      where: { id: balance.id },
      data: { qtySold: balance.qtySold + input.qtySold, qtyOnHand: balance.qtyOnHand - input.qtySold },
    });

    return report;
  });

  return apiSuccess(created, undefined, 201);
}
