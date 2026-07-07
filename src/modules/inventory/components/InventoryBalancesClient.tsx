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
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  inTransitQty: number;
  warehouse: { name: string };
  product: { code: string; name: string };
  lot: { lotNo: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function InventoryBalancesClient() {
  const [rows, setRows] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [warehouseId, setWarehouseId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100" });
    if (warehouseId) params.set("warehouseId", warehouseId);
    const res = await fetch(`/api/inventory/balances?${params}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Tồn kho</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Số liệu tổng hợp từ sổ cái StockMovement — không sửa tay, chỉ thay đổi qua nghiệp vụ (nhập/xuất/điều
        chuyển/kiểm kê).
      </p>

      <div className="mb-4 max-w-xs">
        <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
          <option value="">Tất cả kho</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {String(w.name)}
            </option>
          ))}
        </Select>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có dữ liệu tồn kho" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Kho</Th>
                <Th>Sản phẩm</Th>
                <Th>Lot</Th>
                <Th>Tồn vật lý</Th>
                <Th>Đã giữ</Th>
                <Th>Khả dụng</Th>
                <Th>Đang vận chuyển</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.warehouse.name}</Td>
                  <Td>
                    {row.product.code} - {row.product.name}
                  </Td>
                  <Td>{row.lot?.lotNo ?? "—"}</Td>
                  <Td className="tabular-nums">{row.onHandQty}</Td>
                  <Td className="tabular-nums">{row.reservedQty}</Td>
                  <Td className="tabular-nums font-medium">{row.availableQty}</Td>
                  <Td className="tabular-nums">{row.inTransitQty}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
