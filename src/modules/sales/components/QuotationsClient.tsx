"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Send, ThumbsUp, ThumbsDown, ArrowRightCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface QuotationLine {
  id: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  product: { code: string; name: string };
}

interface QuotationRow {
  id: string;
  code: string;
  status: string;
  customer: { name: string };
  lines: QuotationLine[];
  salesOrders: { id: string; code: string }[];
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

export function QuotationsClient() {
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", unitPrice: "" }]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/sales/quotations");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
    fetchOptions("/api/master-data/products?pageSize=200").then(setProducts);
  }, [load]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function openCreate() {
    setCustomerId("");
    setValidUntil("");
    setLines([{ productId: "", qty: "", unitPrice: "" }]);
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const payload = {
      customerId,
      validUntil: validUntil || undefined,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty), unitPrice: Number(l.unitPrice) || 0 })),
    };

    const res = await fetch("/api/sales/quotations", {
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

  async function handleAction(id: string, action: "send" | "accept" | "reject" | "convert") {
    setActingId(id);
    const res = await fetch(`/api/sales/quotations/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Báo giá</h1>
          <p className="mt-1 text-sm text-text-secondary">Gửi khách hàng → chấp nhận → chuyển thành đơn hàng bán.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo báo giá
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số báo giá</Th>
                <Th>Khách hàng</Th>
                <Th>Tổng tiền</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có báo giá nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const total = row.lines.reduce((s, l) => s + l.totalAmount, 0);
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>{row.customer.name}</Td>
                      <Td className="tabular-nums">{total.toLocaleString("vi-VN")} ₫</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "DRAFT" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "send")} className="gap-1 px-2 py-1 text-xs">
                              <Send size={14} /> Gửi
                            </Button>
                          )}
                          {row.status === "SENT" && (
                            <>
                              <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "accept")} className="gap-1 px-2 py-1 text-xs">
                                <ThumbsUp size={14} /> Chấp nhận
                              </Button>
                              <Button variant="danger" disabled={busy} onClick={() => handleAction(row.id, "reject")} className="gap-1 px-2 py-1 text-xs">
                                <ThumbsDown size={14} /> Từ chối
                              </Button>
                            </>
                          )}
                          {row.status === "ACCEPTED" && row.salesOrders.length === 0 && (
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "convert")} className="gap-1 px-2 py-1 text-xs">
                              <ArrowRightCircle size={14} /> Tạo đơn hàng
                            </Button>
                          )}
                          {row.salesOrders.length > 0 && (
                            <span className="self-center text-xs text-text-secondary">Đã tạo SO {row.salesOrders[0].code}</span>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo báo giá</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Khách hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {String(c.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Hiệu lực đến</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
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
              <Button onClick={handleSubmit} disabled={saving || !customerId}>
                {saving ? "Đang lưu..." : "Tạo báo giá"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
