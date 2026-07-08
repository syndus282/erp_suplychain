"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ShipmentLine {
  id: string;
  qty: number;
  unitCost: number;
  product: { code: string; name: string };
}

interface ShipmentRow {
  id: string;
  code: string;
  status: string;
  dealer: { name: string };
  fromWarehouse: { name: string };
  lines: ShipmentLine[];
}

interface DraftLine {
  productId: string;
  qty: string;
  unitCost: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function ConsignmentShipmentsClient() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [dealers, setDealers] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", unitCost: "" }]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/distribution/consignment-shipments");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?type=DEALER").then(setDealers);
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/master-data/products?pageSize=100").then(setProducts);
  }, [load]);

  function openCreate() {
    setDealerId("");
    setFromWarehouseId("");
    setLines([{ productId: "", qty: "", unitCost: "" }]);
    setFormError(null);
    setPanelOpen(true);
  }

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const payload = {
      dealerId,
      fromWarehouseId,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty), unitCost: Number(l.unitCost) || 0 })),
    };
    const res = await fetch("/api/distribution/consignment-shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  async function handleDeliver(id: string) {
    setActingId(id);
    const res = await fetch(`/api/distribution/consignment-shipments/${id}/deliver`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể giao hàng ký gửi");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Ký gửi hàng cho đại lý</h1>
          <p className="mt-1 text-sm text-text-secondary">Hàng vẫn thuộc sở hữu công ty cho tới khi đại lý báo bán.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo phiếu ký gửi
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số phiếu</Th>
                <Th>Đại lý</Th>
                <Th>Kho xuất</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có phiếu ký gửi nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.dealer.name}</Td>
                    <Td>{row.fromWarehouse.name}</Td>
                    <Td>{row.lines.length}</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      {row.status === "REQUESTED" && (
                        <Button variant="primary" disabled={actingId === row.id} onClick={() => handleDeliver(row.id)} className="gap-1 px-2 py-1 text-xs">
                          <Truck size={14} /> Giao hàng
                        </Button>
                      )}
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
          <div className="glass-surface h-full w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo phiếu ký gửi</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Đại lý <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={dealerId} onChange={(e) => setDealerId(e.target.value)}>
                  <option value="">-- Chọn đại lý --</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {String(d.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Kho xuất <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={fromWarehouseId} onChange={(e) => setFromWarehouseId(e.target.value)}>
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {String(w.name)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Dòng hàng</Label>
                <Button variant="secondary" onClick={() => setLines((prev) => [...prev, { productId: "", qty: "", unitCost: "" }])} className="gap-1 px-2 py-1 text-xs">
                  <Plus size={14} /> Thêm dòng
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {lines.map((line, index) => (
                  <div key={index} className="flex items-end gap-2 rounded-lg border border-text-disabled/20 p-2">
                    <div className="flex-1">
                      <Label>Sản phẩm</Label>
                      <Select value={line.productId} onChange={(e) => updateLine(index, { productId: e.target.value })}>
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {String(p.code)} - {String(p.name)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label>Số lượng</Label>
                      <Input type="number" value={line.qty} onChange={(e) => updateLine(index, { qty: e.target.value })} />
                    </div>
                    <div className="w-32">
                      <Label>Giá vốn</Label>
                      <Input type="number" value={line.unitCost} onChange={(e) => updateLine(index, { unitCost: e.target.value })} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                      className="mb-2 rounded p-2 text-semantic-danger hover:bg-semantic-danger/10"
                      aria-label="Xóa dòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {formError && <p className="mt-4 text-sm text-semantic-danger">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !dealerId || !fromWarehouseId}>
                {saving ? "Đang lưu..." : "Tạo phiếu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
