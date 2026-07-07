"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface PrLine {
  id: string;
  qty: number;
  estimatedPrice: number;
  product: { code: string; name: string };
}

interface PrRow {
  id: string;
  code: string;
  reason: string | null;
  priority: string | null;
  status: string;
  createdAt: string;
  department: { name: string } | null;
  lines: PrLine[];
}

interface DraftLine {
  productId: string;
  qty: string;
  estimatedPrice: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function PurchaseRequestsClient() {
  const [rows, setRows] = useState<PrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);

  const [departmentId, setDepartmentId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("");
  const [approverUserId, setApproverUserId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: "", estimatedPrice: "" }]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/procurement/purchase-requests");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/org/departments?pageSize=100").then(setDepartments);
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/master-data/products?pageSize=100").then(setProducts);
    fetchOptions("/api/org/users").then(setUsers);
  }, [load]);

  function openCreate() {
    setDepartmentId("");
    setWarehouseId("");
    setReason("");
    setPriority("");
    setApproverUserId("");
    setLines([{ productId: "", qty: "", estimatedPrice: "" }]);
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
      departmentId: departmentId || null,
      warehouseId: warehouseId || null,
      reason: reason || undefined,
      priority: priority || undefined,
      approverUserId,
      lines: lines
        .filter((l) => l.productId)
        .map((l) => ({
          productId: l.productId,
          qty: Number(l.qty),
          estimatedPrice: Number(l.estimatedPrice) || 0,
        })),
    };

    const res = await fetch("/api/procurement/purchase-requests", {
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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Đề nghị mua hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Tạo đề nghị mua hàng và gửi duyệt. Chỉ đề nghị đã được duyệt (APPROVED) mới tạo được đơn mua hàng.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo mới
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số PR</Th>
                <Th>Phòng ban</Th>
                <Th>Lý do</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có đề nghị mua hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.department?.name ?? "—"}</Td>
                    <Td>{row.reason ?? "—"}</Td>
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
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo đề nghị mua hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phòng ban</Label>
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {String(d.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Kho nhận</Label>
                <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {String(w.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Lý do mua hàng</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <div>
                <Label>Mức độ ưu tiên</Label>
                <Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="Bình thường / Gấp..." />
              </div>
              <div>
                <Label>
                  Người duyệt <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={approverUserId} onChange={(e) => setApproverUserId(e.target.value)}>
                  <option value="">-- Chọn người duyệt --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {String(u.username)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Danh sách hàng cần mua</Label>
                <Button
                  variant="secondary"
                  onClick={() => setLines((prev) => [...prev, { productId: "", qty: "", estimatedPrice: "" }])}
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
                      <Label>Đơn giá dự kiến</Label>
                      <Input
                        type="number"
                        value={line.estimatedPrice}
                        onChange={(e) => updateLine(index, { estimatedPrice: e.target.value })}
                      />
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
            <FieldError message={undefined} />

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !approverUserId}>
                {saving ? "Đang gửi..." : "Gửi duyệt"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
