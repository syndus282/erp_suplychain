"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface SoLine {
  id: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  totalAmount: number;
  qtyDelivered: number;
  qtyReserved: number;
  product: { code: string; name: string };
  reservations: { id: string; qty: number; warehouseId: string }[];
}

interface SoDetail {
  id: string;
  code: string;
  status: string;
  salesChannel: string;
  deliveryAddress: string | null;
  paymentTerm: string | null;
  confirmedAt: string | null;
  expectedDeliveryDate: string | null;
  customer: { name: string; code: string; creditLimit: number; currentDebt: number };
  quotation: { id: string; code: string } | null;
  lines: SoLine[];
}

export function SalesOrderDetailClient({ soId }: { soId: string }) {
  const [so, setSo] = useState<SoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/sales/orders/${soId}`);
    const body = await res.json();
    if (body.success) setSo(body.data);
    else setError(body.error?.message ?? "Không tải được đơn hàng");
    setLoading(false);
  }, [soId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <Link href="/sales/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Quay lại danh sách đơn hàng
      </Link>

      {loading ? (
        <EmptyState message="Đang tải..." />
      ) : error || !so ? (
        <EmptyState message={error ?? "Không tìm thấy đơn hàng"} />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Đơn hàng {so.code}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Khách hàng: {so.customer.name} ({so.customer.code})
                {so.quotation && (
                  <>
                    {" "}
                    — từ báo giá <span className="font-medium">{so.quotation.code}</span>
                  </>
                )}
              </p>
            </div>
            <StatusBadge status={so.status} />
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-text-secondary">Hạn mức tín dụng</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{so.customer.creditLimit.toLocaleString("vi-VN")} ₫</p>
            </Card>
            <Card>
              <p className="text-xs text-text-secondary">Công nợ hiện tại</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{so.customer.currentDebt.toLocaleString("vi-VN")} ₫</p>
            </Card>
            <Card>
              <p className="text-xs text-text-secondary">Kênh bán hàng</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{so.salesChannel === "ONLINE" ? "Online" : "Offline"}</p>
            </Card>
          </div>

          <Card className="p-0">
            <Table>
              <Thead>
                <tr>
                  <Th>Sản phẩm</Th>
                  <Th>Số lượng</Th>
                  <Th>Đơn giá</Th>
                  <Th>Thành tiền</Th>
                  <Th>Đã giữ hàng</Th>
                  <Th>Đã giao</Th>
                </tr>
              </Thead>
              <tbody>
                {so.lines.map((line) => (
                  <Tr key={line.id}>
                    <Td>
                      {line.product.code} - {line.product.name}
                    </Td>
                    <Td>{line.qty}</Td>
                    <Td className="tabular-nums">{line.unitPrice.toLocaleString("vi-VN")} ₫</Td>
                    <Td className="tabular-nums">{line.totalAmount.toLocaleString("vi-VN")} ₫</Td>
                    <Td>{line.qtyReserved}</Td>
                    <Td>{line.qtyDelivered}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <p className="mt-4 text-xs text-text-secondary">
            Giao hàng thực tế (xuất kho, POD) và xuất hóa đơn/thu tiền thuộc phân hệ Logistics (Phase 6) và Kế toán (Phase 8).
          </p>
        </>
      )}
    </div>
  );
}
