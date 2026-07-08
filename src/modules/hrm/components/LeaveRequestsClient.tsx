"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Check, Ban } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface LeaveRow {
  id: string;
  type: string;
  fromDate: string;
  toDate: string;
  status: string;
  employee: { code: string; fullName: string };
}

const TYPE_OPTIONS = [
  { value: "ANNUAL", label: "Nghỉ phép năm" },
  { value: "SICK", label: "Nghỉ ốm" },
  { value: "UNPAID", label: "Nghỉ không lương" },
  { value: "SPECIAL", label: "Nghỉ đặc biệt" },
];

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function LeaveRequestsClient() {
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Option[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("ANNUAL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hrm/leave-requests");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
  }, [load]);

  function openCreate() {
    setEmployeeId("");
    setType("ANNUAL");
    setFromDate("");
    setToDate("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/hrm/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, type, fromDate, toDate }),
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

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    const res = await fetch(`/api/hrm/leave-requests/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Đơn nghỉ phép</h1>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo đơn nghỉ
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Nhân viên</Th>
                <Th>Loại nghỉ</Th>
                <Th>Từ ngày</Th>
                <Th>Đến ngày</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có đơn nghỉ phép nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>
                        {row.employee.code} - {row.employee.fullName}
                      </Td>
                      <Td>{TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type}</Td>
                      <Td>{row.fromDate.slice(0, 10)}</Td>
                      <Td>{row.toDate.slice(0, 10)}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        {row.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "approve")} className="gap-1 px-2 py-1 text-xs">
                              <Check size={14} /> Duyệt
                            </Button>
                            <Button variant="danger" disabled={busy} onClick={() => handleAction(row.id, "reject")} className="gap-1 px-2 py-1 text-xs">
                              <Ban size={14} /> Từ chối
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo đơn nghỉ phép</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>
                  Nhân viên <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {String(e.code)} - {String(e.fullName)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Loại nghỉ</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Từ ngày</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !employeeId || !fromDate || !toDate}>
                {saving ? "Đang lưu..." : "Tạo đơn"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
