"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface MovementRow {
  id: string;
  type: string;
  qty: number;
  refType: string | null;
  movementDate: string;
  warehouse: { name: string };
  product: { code: string; name: string };
  lot: { lotNo: string } | null;
}

const TYPE_TONE: Record<string, "success" | "danger" | "info" | "warning" | "neutral"> = {
  RECEIPT: "success",
  TRANSFER_IN: "success",
  ISSUE: "danger",
  TRANSFER_OUT: "danger",
  CONSIGNMENT_OUT: "danger",
  CONSIGNMENT_RETURN: "success",
  WARRANTY_OUT: "danger",
  WARRANTY_IN: "success",
  ADJUSTMENT: "warning",
};

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function StockMovementsClient() {
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [warehouseId, setWarehouseId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "50" });
    if (warehouseId) params.set("warehouseId", warehouseId);
    const res = await fetch(`/api/inventory/movements?${params}`);
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
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Sổ cái tồn kho (Stock Movement)</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Nguồn sự thật duy nhất cho mọi biến động tồn kho — không sửa/xóa trực tiếp.
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
          <EmptyState message="Chưa có biến động tồn kho nào" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Thời gian</Th>
                <Th>Loại</Th>
                <Th>Kho</Th>
                <Th>Sản phẩm</Th>
                <Th>Lot</Th>
                <Th>Số lượng</Th>
                <Th>Nguồn</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{new Date(row.movementDate).toLocaleString("vi-VN")}</Td>
                  <Td>
                    <Badge tone={TYPE_TONE[row.type] ?? "neutral"}>{row.type}</Badge>
                  </Td>
                  <Td>{row.warehouse.name}</Td>
                  <Td>
                    {row.product.code} - {row.product.name}
                  </Td>
                  <Td>{row.lot?.lotNo ?? "—"}</Td>
                  <Td className={`tabular-nums font-medium ${row.qty < 0 ? "text-semantic-danger" : "text-semantic-success"}`}>
                    {row.qty > 0 ? `+${row.qty}` : row.qty}
                  </Td>
                  <Td>{row.refType ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
