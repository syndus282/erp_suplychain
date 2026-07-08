import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/modules/auth/lib/session";
import { requirePermission } from "@/modules/auth/lib/permissions";
import { apiSuccess } from "@/lib/api/response";
import { computeActiveAlerts } from "./alerts";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

/**
 * Doanh thu lấy từ GL (JournalEntryLine Có tài khoản 511) — nguồn sự thật duy
 * nhất đã có sẵn từ Phase 8 (ghi nhận khi tạo CustomerInvoice), không cộng lại
 * từ SalesOrder/CustomerInvoice để tránh 2 công thức tính doanh thu khác
 * nhau có thể lệch nhau.
 */
async function sumRevenue(companyId: string, from: Date): Promise<number> {
  const result = await prisma.journalEntryLine.aggregate({
    where: { journalEntry: { companyId, status: "POSTED", date: { gte: from } }, account: { code: "511" } },
    _sum: { credit: true },
  });
  return result._sum.credit ?? 0;
}

const AGING_BUCKETS = [
  { key: "days0to90", maxDays: 90 },
  { key: "days90to180", maxDays: 180 },
  { key: "days180to365", maxDays: 365 },
] as const;

/**
 * Tuổi tồn kho (docs/business-spec/11 mục 11) tính theo ngày kể từ lần nhập
 * kho (RECEIPT/TRANSFER_IN) gần nhất của đúng tổ hợp product+warehouse+lot —
 * KHÔNG có model lưu sẵn "ngày nhập" nên phải tra `StockMovement` gần nhất.
 * Balance không tìm được lần nhập nào (dữ liệu cũ trước khi có StockMovement
 * ghi nhận) xếp vào "unknown" thay vì bỏ qua để không làm sai lệch tổng.
 */
async function getInventoryAging(companyId: string) {
  const balances = await prisma.inventoryBalance.findMany({
    where: { companyId, onHandQty: { gt: 0 } },
    select: { productId: true, warehouseId: true, lotId: true, onHandQty: true },
  });
  if (balances.length === 0) {
    return { days0to90: 0, days90to180: 0, days180to365: 0, over365: 0, unknown: 0 };
  }

  const lastReceipts = await prisma.stockMovement.groupBy({
    by: ["productId", "warehouseId", "lotId"],
    where: { companyId, type: { in: ["RECEIPT", "TRANSFER_IN"] } },
    _max: { movementDate: true },
  });
  const lastReceiptMap = new Map(
    lastReceipts.map((r) => [`${r.productId}|${r.warehouseId}|${r.lotId ?? ""}`, r._max.movementDate])
  );

  const now = Date.now();
  const buckets = { days0to90: 0, days90to180: 0, days180to365: 0, over365: 0, unknown: 0 };
  for (const b of balances) {
    const lastReceiptDate = lastReceiptMap.get(`${b.productId}|${b.warehouseId}|${b.lotId ?? ""}`);
    if (!lastReceiptDate) {
      buckets.unknown += b.onHandQty;
      continue;
    }
    const daysSince = (now - lastReceiptDate.getTime()) / (24 * 60 * 60 * 1000);
    const bucket = AGING_BUCKETS.find((bk) => daysSince <= bk.maxDays);
    if (bucket) buckets[bucket.key] += b.onHandQty;
    else buckets.over365 += b.onHandQty;
  }
  return buckets;
}

export async function getExecutiveDashboard() {
  const session = await getCurrentSession();
  requirePermission(session, "bi-dashboard", "read");
  const companyId = session.companyId;
  const now = new Date();

  const [revenueToday, revenueMonth, revenueYear] = await Promise.all([
    sumRevenue(companyId, startOfDay(now)),
    sumRevenue(companyId, startOfMonth(now)),
    sumRevenue(companyId, startOfYear(now)),
  ]);

  const invoices = await prisma.customerInvoice.findMany({
    where: { companyId, status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] } },
    select: { amount: true, paidAmount: true },
  });
  const arOutstanding = invoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0);

  const balances = await prisma.inventoryBalance.groupBy({
    by: ["productId"],
    where: { companyId },
    _sum: { onHandQty: true },
  });
  const skuCount = balances.filter((b) => (b._sum.onHandQty ?? 0) > 0).length;

  // Định giá tồn kho XẤP XỈ bằng đơn giá bình quân từ các dòng PO của sản
  // phẩm đó (KHÔNG phải giá vốn FIFO/bình quân gia quyền chuẩn kế toán, và
  // chưa cộng landed cost phân bổ — để lại cho phase kế toán tồn kho nâng cao
  // nếu cần chính xác tuyệt đối).
  let inventoryValue = 0;
  if (balances.length > 0) {
    const poLines = await prisma.purchaseOrderLine.findMany({
      where: { productId: { in: balances.map((b) => b.productId) }, purchaseOrder: { companyId } },
      select: { productId: true, unitPrice: true },
    });
    const priceAgg = new Map<string, { sum: number; count: number }>();
    for (const l of poLines) {
      const cur = priceAgg.get(l.productId) ?? { sum: 0, count: 0 };
      cur.sum += l.unitPrice;
      cur.count += 1;
      priceAgg.set(l.productId, cur);
    }
    for (const b of balances) {
      const agg = priceAgg.get(b.productId);
      if (agg && agg.count > 0) inventoryValue += (agg.sum / agg.count) * (b._sum.onHandQty ?? 0);
    }
  }

  const topProductLines = await prisma.salesOrderLine.groupBy({
    by: ["productId"],
    where: { salesOrder: { companyId, status: { not: "CANCELLED" } } },
    _sum: { totalAmount: true, qty: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: 5,
  });
  const topProductInfo = await prisma.product.findMany({
    where: { id: { in: topProductLines.map((l) => l.productId) } },
    select: { id: true, code: true, name: true },
  });
  const topProductInfoMap = new Map(topProductInfo.map((p) => [p.id, p]));
  const topProducts = topProductLines.map((l) => ({
    product: topProductInfoMap.get(l.productId) ?? null,
    revenue: l._sum.totalAmount ?? 0,
    qty: l._sum.qty ?? 0,
  }));

  const topCustomerInvoices = await prisma.customerInvoice.groupBy({
    by: ["customerId"],
    where: { companyId },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });
  const topCustomerInfo = await prisma.customer.findMany({
    where: { id: { in: topCustomerInvoices.map((c) => c.customerId) } },
    select: { id: true, code: true, name: true },
  });
  const topCustomerInfoMap = new Map(topCustomerInfo.map((c) => [c.id, c]));
  const topCustomers = topCustomerInvoices.map((c) => ({
    customer: topCustomerInfoMap.get(c.customerId) ?? null,
    revenue: c._sum.amount ?? 0,
  }));

  const [inventoryAging, alerts] = await Promise.all([
    getInventoryAging(companyId),
    computeActiveAlerts(companyId),
  ]);

  return apiSuccess({
    revenueToday,
    revenueMonth,
    revenueYear,
    arOutstanding,
    inventoryValue: Math.round(inventoryValue),
    skuCount,
    inventoryAging,
    topProducts,
    topCustomers,
    activeAlertCount: alerts.length,
  });
}
