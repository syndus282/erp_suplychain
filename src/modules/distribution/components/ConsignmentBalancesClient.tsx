"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface BalanceRow {
  id: string;
  qtyShipped: number;
  qtySold: number;
  qtyReturned: number;
  qtyOnHand: number;
  dealer: { name: string };
  product: { code: string; name: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function ConsignmentBalancesClient() {
  const [rows, setRows] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<Option[]>([]);
  const [dealerId, setDealerId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100" });
    if (dealerId) params.set("dealerId", dealerId);
    const res = await fetch(`/api/distribution/consignment-balances?${params}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [dealerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchOptions("/api/distribution/customers?type=DEALER").then(setDealers);
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Tồn kho ký gửi</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Hàng đã gửi / đã bán / còn tồn tại từng đại lý — độc lập với tồn kho công ty.
      </p>

      <div className="mb-4 max-w-xs">
        <Select value={dealerId} onChange={(e) => setDealerId(e.target.value)}>
          <option value="">Tất cả đại lý</option>
          {dealers.map((d) => (
            <option key={d.id} value={d.id}>
              {String(d.name)}
            </option>
          ))}
        </Select>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có dữ liệu ký gửi" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Đại lý</Th>
                <Th>Sản phẩm</Th>
                <Th>Đã gửi</Th>
                <Th>Đã bán</Th>
                <Th>Đã thu hồi</Th>
                <Th>Còn tồn</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.dealer.name}</Td>
                  <Td>
                    {row.product.code} - {row.product.name}
                  </Td>
                  <Td className="tabular-nums">{row.qtyShipped}</Td>
                  <Td className="tabular-nums">{row.qtySold}</Td>
                  <Td className="tabular-nums">{row.qtyReturned}</Td>
                  <Td className="tabular-nums font-medium">{row.qtyOnHand}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
