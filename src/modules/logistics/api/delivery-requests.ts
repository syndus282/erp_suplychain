import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, notFoundError } from "@/lib/api/errors";
import { parsePagination, parseSort, buildPageMeta } from "@/lib/api/pagination";
import { generateCode } from "@/modules/procurement/lib/codegen";

const include = {
  customer: true,
  lines: { include: { product: true } },
};

export async function listDeliveryRequests(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "delivery-request", "read");

  const url = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(url.searchParams);
  const orderBy = parseSort(url.searchParams, ["code", "requestedAt"], { requestedAt: "desc" });

  const where = { companyId: session.companyId };
  const [items, totalItems] = await Promise.all([
    prisma.deliveryRequest.findMany({ where, orderBy, skip, take, include }),
    prisma.deliveryRequest.count({ where }),
  ]);

  return apiSuccess(items, buildPageMeta(page, pageSize, totalItems));
}

/**
 * Nguồn tạo Delivery Request hỗ trợ ở Phase 6: Sales Order (docs/business-spec/06
 * mục 5). Ký gửi/bảo hành/điều chuyển đã có luồng xuất kho riêng ở Phase 3-4,
 * để lại việc bọc chúng qua Delivery Request (gom chuyến, tài xế, POD) cho
 * phase sau nếu cần — không phải sót việc, xem docs/TASKS.md.
 */
export async function createDeliveryRequestFromSalesOrder(request: Request) {
  const session = await getCurrentSession();
  requirePermission(session, "delivery-request", "create");

  const body = (await request.json()) as { soId?: string };
  if (!body.soId) throw businessRuleError("Thiếu soId", { rule: "SO_ID_REQUIRED" });

  const so = await prisma.salesOrder.findUnique({ where: { id: body.soId }, include: { lines: true } });
  if (!so || so.companyId !== session.companyId) throw notFoundError("Không tìm thấy đơn hàng");
  if (so.status !== "ALLOCATED") {
    throw businessRuleError("Chỉ có thể tạo yêu cầu giao hàng cho đơn hàng đã Giữ hàng (Allocated)", {
      rule: "SO_NOT_ALLOCATED",
      currentStatus: so.status,
    });
  }

  const existing = await prisma.deliveryRequest.findFirst({
    where: { companyId: session.companyId, sourceType: "SALES_ORDER", sourceId: so.id },
  });
  if (existing) {
    throw businessRuleError("Đơn hàng này đã có yêu cầu giao hàng", { rule: "DELIVERY_REQUEST_ALREADY_EXISTS" });
  }

  const linesToDeliver = so.lines.filter((l) => l.qtyReserved > l.qtyDelivered);
  if (linesToDeliver.length === 0) {
    throw businessRuleError("Đơn hàng không có dòng hàng nào đã giữ hàng để giao", {
      rule: "NO_RESERVED_LINES",
    });
  }

  const created = await prisma.deliveryRequest.create({
    data: {
      companyId: session.companyId,
      code: generateCode("DR"),
      sourceType: "SALES_ORDER",
      sourceId: so.id,
      customerId: so.customerId,
      deliveryAddress: so.deliveryAddress,
      status: "DRAFT",
      lines: {
        create: linesToDeliver.map((l) => ({ productId: l.productId, qty: l.qtyReserved - l.qtyDelivered })),
      },
    },
    include,
  });

  return apiSuccess(created, undefined, 201);
}
