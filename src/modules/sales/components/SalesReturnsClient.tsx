"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Check, Ban, PackageCheck, ClipboardCheck, HandCoins } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ReturnLine {
  id: string;
  qty: number;
  reason: string | null;
  product: { code: string; name: string };
}

interface ReturnRow {
  id: string;
  code: string;
  status: string;
  customer: { name: string };
  salesOrder: { code: string };
  lines: ReturnLine[];
}

interface DraftLine {
  productId: string;
  qty: string;
  reason: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function SalesReturnsClient() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [salesOrders, setSalesOrders] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);

  const [soId, setSoId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", reason: "" }]);

  const [receivePanelRow, setReceivePanelRow] = useState<ReturnRow | null>(null);
  const [receiveWarehouseId, setReceiveWarehouseId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/sales/returns");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/sales/orders?pageSize=200").then((all) =>
      setSalesOrders(all.filter((so) => !["DRAFT", "CANCELLED"].includes(String(so.status))))
    );
    fetchOptions("/api/master-data/products?pageSize=200").then(setProducts);
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
  }, [load]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function openCreate() {
    setSoId("");
    setLines([{ productId: "", qty: "", reason: "" }]);
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const payload = {
      soId,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty), reason: l.reason || undefined })),
    };

    const res = await fetch("/api/sales/returns", {
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

  async function handleAction(id: string, action: "approve" | "reject" | "qc" | "refund") {
    setActingId(id);
    const res = await fetch(`/api/sales/returns/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  async function submitReceive() {
    if (!receivePanelRow) return;
    setActingId(receivePanelRow.id);
    setActionError(null);
    const res = await fetch(`/api/sales/returns/${receivePanelRow.id}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId: receiveWarehouseId }),
    });
    const body = await res.json();
    if (!body.success) {
      setActionError(body.error?.message ?? "Không thể nhận hàng trả");
      setActingId(null);
      return;
    }
    setActingId(null);
    setReceivePanelRow(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Trả hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">Yêu cầu trả → Duyệt → Nhận hàng (nhập lại kho) → Kiểm tra chất lượng → Hoàn tiền/đổi hàng.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={salesOrders.length === 0}>
          <Plus size={16} /> Tạo yêu cầu trả hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số phiếu trả</Th>
                <Th>Đơn hàng gốc</Th>
                <Th>Khách hàng</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có yêu cầu trả hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>{row.salesOrder.code}</Td>
                      <Td>{row.customer.name}</Td>
                      <Td>{row.lines.length}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "REQUESTED" && (
                            <>
                              <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "approve")} className="gap-1 px-2 py-1 text-xs">
                                <Check size={14} /> Duyệt
                              </Button>
                              <Button variant="danger" disabled={busy} onClick={() => handleAction(row.id, "reject")} className="gap-1 px-2 py-1 text-xs">
                                <Ban size={14} /> Từ chối
                              </Button>
                            </>
                          )}
                          {row.status === "APPROVED" && (
                            <Button
                              variant="secondary"
                              disabled={busy}
                              onClick={() => {
                                setReceivePanelRow(row);
                                setReceiveWarehouseId("");
                                setActionError(null);
                              }}
                              className="gap-1 px-2 py-1 text-xs"
                            >
                              <PackageCheck size={14} /> Nhận hàng
                            </Button>
                          )}
                          {row.status === "RECEIVED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "qc")} className="gap-1 px-2 py-1 text-xs">
                              <ClipboardCheck size={14} /> QC xong
                            </Button>
                          )}
                          {row.status === "QC_DONE" && (
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "refund")} className="gap-1 px-2 py-1 text-xs">
                              <HandCoins size={14} /> Hoàn tiền/đổi hàng
                            </Button>
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo yêu cầu trả hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div>
              <Label>
                Đơn hàng gốc <span className="text-semantic-danger">*</span>
              </Label>
              <Select value={soId} onChange={(e) => setSoId(e.target.value)}>
                <option value="">-- Chọn đơn hàng --</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {String(so.code)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Dòng hàng trả</Label>
                <Button
                  variant="secondary"
                  onClick={() => setLines((prev) => [...prev, { productId: "", qty: "", reason: "" }])}
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
                    <div className="flex-1">
                      <Label>Lý do</Label>
                      <Input value={line.reason} onChange={(e) => updateLine(index, { reason: e.target.value })} />
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
              <Button onClick={handleSubmit} disabled={saving || !soId}>
                {saving ? "Đang lưu..." : "Tạo yêu cầu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {receivePanelRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Nhận hàng trả {receivePanelRow.code}</h2>
              <button type="button" onClick={() => setReceivePanelRow(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <Label>
              Kho nhận hàng <span className="text-semantic-danger">*</span>
            </Label>
            <Select value={receiveWarehouseId} onChange={(e) => setReceiveWarehouseId(e.target.value)}>
              <option value="">-- Chọn kho --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {String(w.name)}
                </option>
              ))}
            </Select>
            {actionError && <p className="mt-3 text-sm text-semantic-danger">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setReceivePanelRow(null)}>
                Hủy
              </Button>
              <Button onClick={submitReceive} disabled={actingId === receivePanelRow.id || !receiveWarehouseId}>
                {actingId === receivePanelRow.id ? "Đang xử lý..." : "Xác nhận nhận hàng"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
