"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface DashboardData {
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
  arOutstanding: number;
  inventoryValue: number;
  skuCount: number;
  inventoryAging: { days0to90: number; days90to180: number; days180to365: number; over365: number; unknown: number };
  topProducts: { product: { code: string; name: string } | null; revenue: number; qty: number }[];
  topCustomers: { customer: { code: string; name: string } | null; revenue: number }[];
  activeAlertCount: number;
}

function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + " ₫";
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
    </Card>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/bi/dashboard");
    const body = await res.json();
    if (body.success) setData(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-text-primary">Dashboard</h1>
        <EmptyState message="Đang tải..." />
      </div>
    );
  }

  const aging = data.inventoryAging;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Dashboard điều hành</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Doanh thu tính từ bút toán GL (tài khoản 511) — số liệu cập nhật theo thời gian thực.
          </p>
        </div>
        {data.activeAlertCount > 0 && (
          <Link
            href="/bi/alerts"
            className="flex items-center gap-1.5 rounded-lg bg-semantic-danger/10 px-3 py-1.5 text-sm font-medium text-semantic-danger hover:bg-semantic-danger/20"
          >
            <AlertTriangle size={16} />
            {data.activeAlertCount} cảnh báo đang mở
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Doanh thu hôm nay" value={formatVnd(data.revenueToday)} />
        <KpiCard label="Doanh thu tháng này" value={formatVnd(data.revenueMonth)} />
        <KpiCard label="Doanh thu năm nay" value={formatVnd(data.revenueYear)} />
        <KpiCard label="Công nợ phải thu" value={formatVnd(data.arOutstanding)} />
        <KpiCard label="Giá trị tồn kho (ước tính)" value={formatVnd(data.inventoryValue)} />
        <KpiCard label="Số SKU đang có tồn" value={String(data.skuCount)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-0">
          <div className="p-4 pb-0">
            <h2 className="text-sm font-semibold text-text-primary">Top 5 sản phẩm theo doanh thu</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <EmptyState message="Chưa có dữ liệu bán hàng" />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Sản phẩm</Th>
                  <Th>SL bán</Th>
                  <Th>Doanh thu</Th>
                </tr>
              </Thead>
              <tbody>
                {data.topProducts.map((row, i) => (
                  <Tr key={i}>
                    <Td>{row.product ? `${row.product.code} - ${row.product.name}` : "—"}</Td>
                    <Td className="tabular-nums">{row.qty}</Td>
                    <Td className="tabular-nums">{formatVnd(row.revenue)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card className="p-0">
          <div className="p-4 pb-0">
            <h2 className="text-sm font-semibold text-text-primary">Top 5 khách hàng theo doanh thu</h2>
          </div>
          {data.topCustomers.length === 0 ? (
            <EmptyState message="Chưa có hóa đơn bán hàng" />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Khách hàng</Th>
                  <Th>Doanh thu hóa đơn</Th>
                </tr>
              </Thead>
              <tbody>
                {data.topCustomers.map((row, i) => (
                  <Tr key={i}>
                    <Td>{row.customer ? `${row.customer.code} - ${row.customer.name}` : "—"}</Td>
                    <Td className="tabular-nums">{formatVnd(row.revenue)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Tuổi tồn kho (theo lần nhập gần nhất)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <p className="text-xs text-text-secondary">0-90 ngày</p>
            <p className="text-lg font-semibold tabular-nums text-text-primary">{aging.days0to90}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">90-180 ngày</p>
            <p className="text-lg font-semibold tabular-nums text-text-primary">{aging.days90to180}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">180-365 ngày</p>
            <p className="text-lg font-semibold tabular-nums text-text-primary">{aging.days180to365}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">&gt;365 ngày</p>
            <p className="text-lg font-semibold tabular-nums text-semantic-danger">{aging.over365}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Chưa rõ ngày nhập</p>
            <p className="text-lg font-semibold tabular-nums text-text-secondary">{aging.unknown}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
