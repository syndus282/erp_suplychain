"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface SerialRow {
  id: string;
  serialNo: string;
  status: string;
  product: { code: string; name: string };
  warehouse: { name: string } | null;
}

const STATUS_OPTIONS = ["IN_STOCK", "RESERVED", "SOLD", "CONSIGNED", "IN_WARRANTY", "DEFECTIVE", "RETURNED"];

export function SerialNumbersClient() {
  const [rows, setRows] = useState<SerialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "50" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/inventory/serial-numbers?${params}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Serial Number</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Theo dõi từng đơn vị serial (ECU, Turbo, Hộp số...) — tạo tự động khi nhận hàng ở Phiếu nhập kho.
      </p>

      <div className="mb-4 flex gap-3">
        <Input placeholder="Tìm theo serial number..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có serial number nào" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Serial No</Th>
                <Th>Sản phẩm</Th>
                <Th>Kho hiện tại</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td className="font-mono">{row.serialNo}</Td>
                  <Td>
                    {row.product.code} - {row.product.name}
                  </Td>
                  <Td>{row.warehouse?.name ?? "—"}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
