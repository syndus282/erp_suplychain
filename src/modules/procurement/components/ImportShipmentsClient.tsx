"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, PackageSearch } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ShipmentRow {
  id: string;
  code: string;
  status: string;
  eta: string | null;
  supplier: { name: string };
  purchaseOrder: { code: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function ImportShipmentsClient() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [purchaseOrders, setPurchaseOrders] = useState<Option[]>([]);
  const [poId, setPoId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [eta, setEta] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/procurement/import-shipments");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/procurement/purchase-orders").then(setPurchaseOrders);
  }, [load]);

  function openCreate() {
    setPoId("");
    setSupplierId("");
    setEta("");
    setFormError(null);
    setPanelOpen(true);
  }

  function handlePoChange(id: string) {
    setPoId(id);
    const po = purchaseOrders.find((p) => p.id === id) as { supplier?: { id: string } } | undefined;
    if (po?.supplier?.id) setSupplierId(po.supplier.id);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const res = await fetch("/api/procurement/import-shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poId, supplierId, eta: eta || undefined }),
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
          <h1 className="text-xl font-semibold text-text-primary">Lô hàng nhập khẩu</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi lô hàng nhập khẩu ủy thác (đơn giản hóa, chưa có bước hải quan chi tiết).
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo lô hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Mã lô hàng</Th>
                <Th>Đơn mua hàng</Th>
                <Th>Nhà cung cấp</Th>
                <Th>ETA</Th>
                <Th>Trạng thái</Th>
                <Th>Chi phí</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có lô hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.purchaseOrder?.code}</Td>
                    <Td>{row.supplier?.name}</Td>
                    <Td>{row.eta ? new Date(row.eta).toLocaleDateString("vi-VN") : "—"}</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      <Link
                        href={`/procurement/import-shipments/${row.id}`}
                        className="inline-flex items-center gap-1 text-brand-primary hover:underline"
                      >
                        <PackageSearch size={14} /> Landed cost
                      </Link>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-md overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo lô hàng nhập khẩu</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label>
                  Đơn mua hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={poId} onChange={(e) => handlePoChange(e.target.value)}>
                  <option value="">-- Chọn PO --</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {String(po.code)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>ETA (ngày dự kiến đến)</Label>
                <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
              </div>

              {formError && <p className="text-sm text-semantic-danger">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={saving || !poId || !supplierId}>
                  {saving ? "Đang lưu..." : "Tạo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
