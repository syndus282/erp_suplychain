"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, X, CheckCircle2, PackageCheck, Ban } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface SoLine {
  id: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  qtyReserved: number;
  product: { code: string; name: string };
}

interface SoRow {
  id: string;
  code: string;
  status: string;
  customer: { name: string };
  lines: SoLine[];
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

export function SalesOrdersClient() {
  const [rows, setRows] = useState<SoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", unitPrice: "" }]);

  const [actionPanel, setActionPanel] = useState<{ type: "confirm" | "allocate"; row: SoRow } | null>(null);
  const [actionWarehouseId, setActionWarehouseId] = useState("");
  const [actionApproverId, setActionApproverId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/sales/orders");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
    fetchOptions("/api/master-data/products?pageSize=200").then(setProducts);
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/org/users?pageSize=100").then(setUsers);
  }, [load]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function openCreate() {
    setCustomerId("");
    setLines([{ productId: "", qty: "", unitPrice: "" }]);
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const payload = {
      customerId,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty), unitPrice: Number(l.unitPrice) || 0 })),
    };

    const res = await fetch("/api/sales/orders", {
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

  function openAction(type: "confirm" | "allocate", row: SoRow) {
    setActionPanel({ type, row });
    setActionWarehouseId("");
    setActionApproverId("");
    setActionError(null);
  }

  async function submitAction() {
    if (!actionPanel) return;
    setActingId(actionPanel.row.id);
    setActionError(null);

    const url =
      actionPanel.type === "confirm"
        ? `/api/sales/orders/${actionPanel.row.id}/confirm`
        : `/api/sales/orders/${actionPanel.row.id}/allocate`;
    const payload = actionPanel.type === "confirm" ? { approverUserId: actionApproverId || undefined } : { warehouseId: actionWarehouseId };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!body.success) {
      setActionError(body.error?.message ?? "Không thể thực hiện thao tác");
      setActingId(null);
      return;
    }
    setActingId(null);
    setActionPanel(null);
    load();
  }

  async function handleCancel(id: string) {
    if (!confirm("Hủy đơn hàng này?")) return;
    setActingId(id);
    const res = await fetch(`/api/sales/orders/${id}/cancel`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể hủy đơn hàng");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Đơn hàng bán</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Xác nhận (kiểm tra công nợ + chính sách giá) → Giữ hàng (đặt trước tồn kho). Giao hàng/hóa đơn xử lý ở phân hệ Logistics/Kế toán.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo đơn hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số đơn</Th>
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
                    <EmptyState message="Chưa có đơn hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const total = row.lines.reduce((s, l) => s + l.totalAmount, 0);
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <Link href={`/sales/orders/${row.id}`} className="text-brand-primary hover:underline">
                          {row.code}
                        </Link>
                      </Td>
                      <Td>{row.customer.name}</Td>
                      <Td className="tabular-nums">{total.toLocaleString("vi-VN")} ₫</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "DRAFT" && (
                            <Button variant="primary" disabled={busy} onClick={() => openAction("confirm", row)} className="gap-1 px-2 py-1 text-xs">
                              <CheckCircle2 size={14} /> Xác nhận
                            </Button>
                          )}
                          {row.status === "CONFIRMED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => openAction("allocate", row)} className="gap-1 px-2 py-1 text-xs">
                              <PackageCheck size={14} /> Giữ hàng
                            </Button>
                          )}
                          {["DRAFT", "PENDING_APPROVAL", "CONFIRMED", "ALLOCATED"].includes(row.status) && (
                            <Button variant="danger" disabled={busy} onClick={() => handleCancel(row.id)} className="gap-1 px-2 py-1 text-xs">
                              <Ban size={14} /> Hủy
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo đơn hàng bán</h2>
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
                {saving ? "Đang lưu..." : "Tạo đơn"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {actionPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {actionPanel.type === "confirm" ? "Xác nhận đơn hàng" : "Giữ hàng cho đơn"} {actionPanel.row.code}
              </h2>
              <button type="button" onClick={() => setActionPanel(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            {actionPanel.type === "confirm" ? (
              <div>
                <Label>Người phê duyệt (chỉ cần nếu chiết khấu vượt mức cho phép)</Label>
                <Select value={actionApproverId} onChange={(e) => setActionApproverId(e.target.value)}>
                  <option value="">-- Không cần phê duyệt --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {String(u.username)}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Label>
                  Kho xuất hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={actionWarehouseId} onChange={(e) => setActionWarehouseId(e.target.value)}>
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {String(w.name)}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {actionError && <p className="mt-3 text-sm text-semantic-danger">{actionError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActionPanel(null)}>
                Hủy
              </Button>
              <Button onClick={submitAction} disabled={actingId === actionPanel.row.id || (actionPanel.type === "allocate" && !actionWarehouseId)}>
                {actingId === actionPanel.row.id ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
