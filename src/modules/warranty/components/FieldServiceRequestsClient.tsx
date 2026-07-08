"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, UserCheck, Play, CheckCircle2, Ban } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface FsrRow {
  id: string;
  code: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  customer: { name: string };
  technician: { fullName: string } | null;
}

const TYPE_OPTIONS = [
  { value: "INSTALLATION", label: "Lắp đặt" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "REPAIR", label: "Sửa chữa" },
];

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function FieldServiceRequestsClient() {
  const [rows, setRows] = useState<FsrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState("INSTALLATION");
  const [scheduledAt, setScheduledAt] = useState("");

  const [assignPanelRow, setAssignPanelRow] = useState<FsrRow | null>(null);
  const [technicianId, setTechnicianId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/field-service-requests");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
  }, [load]);

  function openCreate() {
    setCustomerId("");
    setType("INSTALLATION");
    setScheduledAt("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/warranty/field-service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, type, scheduledAt: scheduledAt || undefined }),
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

  async function handleSimpleAction(id: string, action: "start" | "complete" | "cancel") {
    setActingId(id);
    const res = await fetch(`/api/warranty/field-service-requests/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  async function submitAssign() {
    if (!assignPanelRow) return;
    setActingId(assignPanelRow.id);
    setActionError(null);
    const res = await fetch(`/api/warranty/field-service-requests/${assignPanelRow.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technicianId }),
    });
    const body = await res.json();
    if (!body.success) {
      setActionError(body.error?.message ?? "Không thể phân công");
      setActingId(null);
      return;
    }
    setActingId(null);
    setAssignPanelRow(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Yêu cầu dịch vụ hiện trường</h1>
          <p className="mt-1 text-sm text-text-secondary">Lắp đặt / Bảo trì / Sửa chữa tại nhà khách hàng — điều phối kỹ thuật viên.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo yêu cầu
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
                <Th>Loại dịch vụ</Th>
                <Th>Khách hàng</Th>
                <Th>Kỹ thuật viên</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có yêu cầu dịch vụ nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>{TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type}</Td>
                      <Td>{row.customer.name}</Td>
                      <Td>{row.technician?.fullName ?? "—"}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {row.status === "REQUESTED" && (
                            <>
                              <Button
                                variant="primary"
                                disabled={busy}
                                onClick={() => {
                                  setAssignPanelRow(row);
                                  setTechnicianId("");
                                  setActionError(null);
                                }}
                                className="gap-1 px-2 py-1 text-xs"
                              >
                                <UserCheck size={14} /> Phân công
                              </Button>
                              <Button variant="danger" disabled={busy} onClick={() => handleSimpleAction(row.id, "cancel")} className="gap-1 px-2 py-1 text-xs">
                                <Ban size={14} /> Hủy
                              </Button>
                            </>
                          )}
                          {row.status === "ASSIGNED" && (
                            <>
                              <Button variant="primary" disabled={busy} onClick={() => handleSimpleAction(row.id, "start")} className="gap-1 px-2 py-1 text-xs">
                                <Play size={14} /> Bắt đầu
                              </Button>
                              <Button variant="danger" disabled={busy} onClick={() => handleSimpleAction(row.id, "cancel")} className="gap-1 px-2 py-1 text-xs">
                                <Ban size={14} /> Hủy
                              </Button>
                            </>
                          )}
                          {row.status === "IN_PROGRESS" && (
                            <Button variant="primary" disabled={busy} onClick={() => handleSimpleAction(row.id, "complete")} className="gap-1 px-2 py-1 text-xs">
                              <CheckCircle2 size={14} /> Hoàn tất
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo yêu cầu dịch vụ</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
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
                <Label>Loại dịch vụ</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Thời gian yêu cầu</Label>
                <Input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !customerId}>
                {saving ? "Đang lưu..." : "Tạo yêu cầu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {assignPanelRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Phân công kỹ thuật viên</h2>
              <button type="button" onClick={() => setAssignPanelRow(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <Label>
              Kỹ thuật viên <span className="text-semantic-danger">*</span>
            </Label>
            <Select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {String(e.fullName)}
                </option>
              ))}
            </Select>
            {actionError && <p className="mt-3 text-sm text-semantic-danger">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAssignPanelRow(null)}>
                Hủy
              </Button>
              <Button onClick={submitAssign} disabled={actingId === assignPanelRow.id || !technicianId}>
                {actingId === assignPanelRow.id ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
