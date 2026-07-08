import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";

export interface BiAlert {
  type: "INVENTORY_REORDER" | "AR_OVERDUE" | "WARRANTY_DEFECT_RATE";
  severity: "warning" | "danger";
  title: string;
  detail: string;
}

const AR_OVERDUE_ALERT_THRESHOLD_DAYS = 30;
const WARRANTY_DEFECT_RATE_ALERT_THRESHOLD = 0.1; // 10%
const WARRANTY_MIN_SAMPLE_SIZE = 5; // tránh báo động giả với mẫu quá nhỏ

/**
 * Cảnh báo chủ động (docs/business-spec/11 mục 26) — tính động trên dữ liệu
 * hiện có, KHÔNG lưu bảng Alert riêng (không có model này trong schema, và
 * dữ liệu nguồn thay đổi liên tục nên tính lại mỗi lần gọi là đủ ở quy mô
 * hiện tại). 3 loại đã làm: tồn kho dưới điểm đặt hàng lại (Product.reorderPoint
 * có sẵn từ Phase 1 nhưng chưa ai dùng), công nợ phải thu quá hạn >30 ngày,
 * tỷ lệ khiếu nại bảo hành bất thường theo sản phẩm.
 */
export async function computeActiveAlerts(companyId: string): Promise<BiAlert[]> {
  const alerts: BiAlert[] = [];

  const products = await prisma.product.findMany({
    where: { companyId, reorderPoint: { gt: 0 }, status: "ACTIVE" },
    select: { id: true, code: true, name: true, reorderPoint: true },
  });
  if (products.length > 0) {
    const balances = await prisma.inventoryBalance.groupBy({
      by: ["productId"],
      where: { companyId, productId: { in: products.map((p) => p.id) } },
      _sum: { availableQty: true },
    });
    const availableByProduct = new Map(balances.map((b) => [b.productId, b._sum.availableQty ?? 0]));
    for (const p of products) {
      const available = availableByProduct.get(p.id) ?? 0;
      if (available < p.reorderPoint) {
        alerts.push({
          type: "INVENTORY_REORDER",
          severity: available <= 0 ? "danger" : "warning",
          title: `SKU ${p.code} - ${p.name} dưới điểm đặt hàng lại`,
          detail: `Tồn khả dụng: ${available} / Điểm đặt hàng lại: ${p.reorderPoint}`,
        });
      }
    }
  }

  const invoices = await prisma.customerInvoice.findMany({
    where: { companyId, status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] } },
    include: { customer: { select: { code: true, name: true } } },
  });
  const now = Date.now();
  const overdueByCustomer = new Map<string, { name: string; total: number; maxDays: number }>();
  for (const inv of invoices) {
    const outstanding = inv.amount - inv.paidAmount;
    if (outstanding <= 0 || !inv.dueDate) continue;
    const daysOverdue = Math.floor((now - inv.dueDate.getTime()) / (24 * 60 * 60 * 1000));
    if (daysOverdue <= AR_OVERDUE_ALERT_THRESHOLD_DAYS) continue;
    const existing = overdueByCustomer.get(inv.customer.code) ?? { name: inv.customer.name, total: 0, maxDays: 0 };
    existing.total += outstanding;
    existing.maxDays = Math.max(existing.maxDays, daysOverdue);
    overdueByCustomer.set(inv.customer.code, existing);
  }
  for (const [code, info] of overdueByCustomer) {
    alerts.push({
      type: "AR_OVERDUE",
      severity: info.maxDays > 60 ? "danger" : "warning",
      title: `Khách hàng ${code} - ${info.name} nợ quá hạn`,
      detail: `Quá hạn ${info.maxDays} ngày, tổng nợ ${info.total.toLocaleString("vi-VN")} VND`,
    });
  }

  const registrations = await prisma.warrantyRegistration.groupBy({
    by: ["productId"],
    where: { companyId },
    _count: { _all: true },
  });
  if (registrations.length > 0) {
    const claims = await prisma.warrantyClaim.findMany({
      where: { companyId },
      include: { registration: { select: { productId: true } } },
    });
    const claimCountByProduct = new Map<string, number>();
    for (const c of claims) {
      claimCountByProduct.set(
        c.registration.productId,
        (claimCountByProduct.get(c.registration.productId) ?? 0) + 1
      );
    }
    const productsInfo = await prisma.product.findMany({
      where: { id: { in: registrations.map((r) => r.productId) } },
      select: { id: true, code: true, name: true },
    });
    const productMap = new Map(productsInfo.map((p) => [p.id, p]));
    for (const r of registrations) {
      const total = r._count._all;
      if (total < WARRANTY_MIN_SAMPLE_SIZE) continue;
      const claimCount = claimCountByProduct.get(r.productId) ?? 0;
      const rate = claimCount / total;
      if (rate > WARRANTY_DEFECT_RATE_ALERT_THRESHOLD) {
        const p = productMap.get(r.productId);
        alerts.push({
          type: "WARRANTY_DEFECT_RATE",
          severity: rate > 0.2 ? "danger" : "warning",
          title: `SKU ${p?.code ?? r.productId} - tỷ lệ bảo hành cao bất thường`,
          detail: `${claimCount}/${total} lượt đăng ký có khiếu nại (${(rate * 100).toFixed(1)}%)`,
        });
      }
    }
  }

  return alerts;
}

export async function getActiveAlerts() {
  const session = await getCurrentSession();
  requirePermission(session, "bi-dashboard", "read");

  const alerts = await computeActiveAlerts(session.companyId);
  return apiSuccess(alerts);
}
