"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Send, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface CountLine {
  id: string;
  systemQty: number;
  actualQty: number;
  varianceQty: number;
  product: { code: string; name: string };
}

interface CountRow {
  id: string;
  code: string;
  status: string;
  warehouse: { name: string };
  lines: CountLine[];
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function StockCountsClient() {
  const [rows, setRows] = useState<CountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [editingCountId, setEditingCountId] = useState<string | null>(null);
  const [actualQtyDraft, setActualQtyDraft] = useState<Record<string, string>>({});

  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/inventory/counts");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/master-data/products?pageSize=100").then(setProducts);
  }, [load]);

  function openCreate() {
    setWarehouseId("");
    setProductIds([]);
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/inventory/counts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId, productIds }),
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

  function openEditActualQty(row: CountRow) {
    setEditingCountId(row.id);
    const draft: Record<string, string> = {};
    for (const l of row.lines) draft[l.id] = String(l.actualQty);
    setActualQtyDraft(draft);
  }

  async function handleSubmitCount(id: string) {
    setActingId(id);
    const row = rows.find((r) => r.id === id)!;
    const lines = row.lines.map((l) => ({ lineId: l.id, actualQty: Number(actualQtyDraft[l.id] ?? l.actualQty) }));
    const res = await fetch(`/api/inventory/counts/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể ghi nhận số liệu");
    setActingId(null);
    setEditingCountId(null);
    load();
  }

  async function handleApprove(id: string) {
    setActingId(id);
    const res = await fetch(`/api/inventory/counts/${id}/approve`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể duyệt phiếu kiểm kê");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Kiểm kê kho</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Ghi nhận số liệu thực tế → duyệt để tự động điều chỉnh tồn kho theo chênh lệch.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo phiếu kiểm kê
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có phiếu kiểm kê nào" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số phiếu</Th>
                <Th>Kho</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.code}</Td>
                  <Td>{row.warehouse.name}</Td>
                  <Td>{row.lines.length}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    {row.status === "DRAFT" && (
                      <Button variant="secondary" onClick={() => openEditActualQty(row)} className="gap-1 px-2 py-1 text-xs">
                        <Send size={14} /> Ghi nhận số liệu
                      </Button>
                    )}
                    {row.status === "SUBMITTED" && (
                      <Button variant="primary" disabled={actingId === row.id} onClick={() => handleApprove(row.id)} className="gap-1 px-2 py-1 text-xs">
                        <CheckCircle2 size={14} /> Duyệt & điều chỉnh tồn
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {editingCountId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-lg overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Ghi nhận số liệu kiểm kê thực tế</h2>
              <button type="button" onClick={() => setEditingCountId(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {rows
                .find((r) => r.id === editingCountId)
                ?.lines.map((line) => (
                  <div key={line.id} className="flex items-center gap-3 rounded-lg border border-text-disabled/20 p-2">
                    <div className="flex-1 text-sm">
                      {line.product.code} - {line.product.name}
                      <div className="text-xs text-text-secondary">Hệ thống: {line.systemQty}</div>
                    </div>
                    <Input
                      type="number"
                      className="w-28"
                      value={actualQtyDraft[line.id] ?? ""}
                      onChange={(e) => setActualQtyDraft((prev) => ({ ...prev, [line.id]: e.target.value }))}
                    />
                  </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingCountId(null)}>
                Hủy
              </Button>
              <Button onClick={() => handleSubmitCount(editingCountId)} disabled={actingId === editingCountId}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-lg overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo phiếu kiểm kê</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label>
                  Kho <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {String(w.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Sản phẩm cần kiểm kê (giữ Ctrl/Cmd để chọn nhiều)</Label>
                <Select
                  multiple
                  value={productIds}
                  onChange={(e) => setProductIds(Array.from(e.target.selectedOptions).map((o) => o.value))}
                  className="h-40"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {String(p.code)} - {String(p.name)}
                    </option>
                  ))}
                </Select>
              </div>

              {formError && <p className="text-sm text-semantic-danger">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={saving || !warehouseId || productIds.length === 0}>
                  {saving ? "Đang lưu..." : "Tạo phiếu"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
