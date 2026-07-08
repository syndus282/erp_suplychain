"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, PackageCheck, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface CoreReturnRow {
  id: string;
  status: string;
  deliveredAt: string;
  dueReturnAt: string | null;
  returnedAt: string | null;
  newSerial: { serialNo: string; product: { code: string } };
  oldSerial: { serialNo: string } | null;
  customer: { name: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function CoreReturnsClient() {
  const [rows, setRows] = useState<CoreReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [serials, setSerials] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);

  const [newSerialId, setNewSerialId] = useState("");
  const [oldSerialId, setOldSerialId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dueReturnAt, setDueReturnAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/core-returns");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/inventory/serial-numbers?pageSize=200").then(setSerials);
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
  }, [load]);

  function openCreate() {
    setNewSerialId("");
    setOldSerialId("");
    setCustomerId("");
    setDueReturnAt("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/warranty/core-returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newSerialId, oldSerialId: oldSerialId || undefined, customerId, dueReturnAt: dueReturnAt || undefined }),
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

  async function handleAction(id: string, action: "receive" | "overdue" | "lost") {
    setActingId(id);
    const res = await fetch(`/api/warranty/core-returns/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Core Return — Thu hồi hàng cũ</h1>
          <p className="mt-1 text-sm text-text-secondary">Theo dõi hàng cũ (ECU/Turbo/Hộp số...) phải thu hồi sau khi đã giao hàng mới cho khách.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo theo dõi
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Serial mới</Th>
                <Th>Serial cũ</Th>
                <Th>Khách hàng</Th>
                <Th>Hạn trả</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có bản ghi nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.newSerial.serialNo}</Td>
                      <Td>{row.oldSerial?.serialNo ?? "—"}</Td>
                      <Td>{row.customer.name}</Td>
                      <Td>{row.dueReturnAt ? row.dueReturnAt.slice(0, 10) : "—"}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        {(row.status === "PENDING" || row.status === "OVERDUE") && (
                          <div className="flex gap-1">
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "receive")} className="gap-1 px-2 py-1 text-xs">
                              <PackageCheck size={14} /> Đã nhận
                            </Button>
                            {row.status === "PENDING" && (
                              <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "overdue")} className="gap-1 px-2 py-1 text-xs">
                                <AlertTriangle size={14} /> Quá hạn
                              </Button>
                            )}
                            <Button variant="danger" disabled={busy} onClick={() => handleAction(row.id, "lost")} className="gap-1 px-2 py-1 text-xs">
                              <XCircle size={14} /> Mất
                            </Button>
                          </div>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo theo dõi thu hồi</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>
                  Serial hàng mới đã giao <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={newSerialId} onChange={(e) => setNewSerialId(e.target.value)}>
                  <option value="">-- Chọn serial --</option>
                  {serials.map((s) => (
                    <option key={s.id} value={s.id}>
                      {String(s.serialNo)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Serial hàng cũ (nếu biết trước)</Label>
                <Select value={oldSerialId} onChange={(e) => setOldSerialId(e.target.value)}>
                  <option value="">-- Chưa biết --</option>
                  {serials.map((s) => (
                    <option key={s.id} value={s.id}>
                      {String(s.serialNo)}
                    </option>
                  ))}
                </Select>
              </div>
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
                <Label>Hạn phải trả</Label>
                <Input type="date" value={dueReturnAt} onChange={(e) => setDueReturnAt(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !newSerialId || !customerId}>
                {saving ? "Đang lưu..." : "Tạo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
