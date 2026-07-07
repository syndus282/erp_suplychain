"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface PoLine {
  id: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  qtyReceived: number;
  qtyRemaining: number;
  product: { code: string; name: string };
}

interface PoRow {
  id: string;
  code: string;
  currency: string;
  exchangeRate: number;
  status: string;
  supplier: { name: string };
  purchaseRequest: { code: string } | null;
  lines: PoLine[];
}

interface DraftLine {
  productId: string;
  qty: string;
  unitPrice: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function PurchaseOrdersClient() {
  const [rows, setRows] = useState<PoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [approvedPrs, setApprovedPrs] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);

  const [prId, setPrId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", unitPrice: "" }]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/procurement/purchase-orders");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/procurement/purchase-requests").then((all) =>
      setApprovedPrs(all.filter((pr) => pr.status === "APPROVED"))
    );
    fetchOptions("/api/procurement/suppliers?pageSize=100").then(setSuppliers);
    fetchOptions("/api/master-data/products?pageSize=100").then(setProducts);
  }, [load]);

  function openCreate() {
    setPrId("");
    setSupplierId("");
    setCurrency("VND");
    setExchangeRate("1");
    setLines([{ productId: "", qty: "", unitPrice: "" }]);
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
      prId,
      supplierId,
      currency,
      exchangeRate: Number(exchangeRate) || 1,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty), unitPrice: Number(l.unitPrice) || 0 })),
    };

    const res = await fetch("/api/procurement/purchase-orders", {
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

  async function handleApprove(id: string) {
    setActingId(id);
    const res = await fetch(`/api/procurement/purchase-orders/${id}/approve`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể duyệt đơn hàng");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Đơn mua hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">Chỉ tạo được từ đề nghị mua hàng đã duyệt.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={approvedPrs.length === 0}>
          <Plus size={16} /> Tạo đơn mua hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số PO</Th>
                <Th>Nhà cung cấp</Th>
                <Th>PR gốc</Th>
                <Th>Tiền tệ</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có đơn mua hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.supplier.name}</Td>
                    <Td>{row.purchaseRequest?.code ?? "—"}</Td>
                    <Td>
                      {row.currency} (x{row.exchangeRate})
                    </Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      {row.status === "DRAFT" && (
                        <Button
                          variant="primary"
                          disabled={actingId === row.id}
                          onClick={() => handleApprove(row.id)}
                          className="gap-1 px-2 py-1 text-xs"
                        >
                          <Check size={14} /> Duyệt
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo đơn mua hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Đề nghị mua hàng (đã duyệt) <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={prId} onChange={(e) => setPrId(e.target.value)}>
                  <option value="">-- Chọn PR --</option>
                  {approvedPrs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {String(pr.code)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Nhà cung cấp <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {String(s.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Tiền tệ</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="VND / USD..." />
              </div>
              <div>
                <Label>Tỷ giá (1 ngoại tệ = ? VND)</Label>
                <Input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Dòng hàng</Label>
                <Button
                  variant="secondary"
                  onClick={() => setLines((prev) => [...prev, { productId: "", qty: "", unitPrice: "" }])}
                  className="gap-1 px-2 py-1 text-xs"
                >
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
                    <div className="w-36">
                      <Label>Đơn giá</Label>
                      <Input type="number" value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: e.target.value })} />
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
              <Button onClick={handleSubmit} disabled={saving || !prId || !supplierId}>
                {saving ? "Đang lưu..." : "Tạo đơn"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
