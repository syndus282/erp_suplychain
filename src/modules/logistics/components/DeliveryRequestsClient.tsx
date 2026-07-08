"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface RequestLine {
  id: string;
  qty: number;
  product: { code: string; name: string };
}

interface RequestRow {
  id: string;
  code: string;
  status: string;
  sourceType: string;
  deliveryAddress: string | null;
  customer: { name: string } | null;
  lines: RequestLine[];
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function DeliveryRequestsClient() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [allocatedSos, setAllocatedSos] = useState<Option[]>([]);
  const [soId, setSoId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/logistics/delivery-requests");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/sales/orders?pageSize=200").then((all) =>
      setAllocatedSos(all.filter((so) => so.status === "ALLOCATED"))
    );
  }, [load]);

  function openCreate() {
    setSoId("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/logistics/delivery-requests/from-sales-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soId }),
    });
    const body = await res.json();
    if (!body.success) {
      setFormError(body.error?.message ?? "Có lỗi xảy ra");
      setSaving(false);
      return;
    }
    setSaving(false);
    setPanelOpen(false);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Yêu cầu giao hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">Tạo từ đơn hàng bán đã Giữ hàng (Allocated) — gom vào Chuyến hàng để xuất kho và giao.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={allocatedSos.length === 0}>
          <Plus size={16} /> Tạo từ đơn hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số yêu cầu</Th>
                <Th>Khách hàng</Th>
                <Th>Địa chỉ giao</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có yêu cầu giao hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.customer?.name ?? "—"}</Td>
                    <Td>{row.deliveryAddress ?? "—"}</Td>
                    <Td>{row.lines.length}</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo yêu cầu giao hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <Label>
              Đơn hàng bán (đã Giữ hàng) <span className="text-semantic-danger">*</span>
            </Label>
            <Select value={soId} onChange={(e) => setSoId(e.target.value)}>
              <option value="">-- Chọn đơn hàng --</option>
              {allocatedSos.map((so) => (
                <option key={so.id} value={so.id}>
                  {String(so.code)}
                </option>
              ))}
            </Select>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !soId}>
                {saving ? "Đang lưu..." : "Tạo yêu cầu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
