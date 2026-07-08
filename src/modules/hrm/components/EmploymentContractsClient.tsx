"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ContractRow {
  id: string;
  type: string | null;
  startDate: string;
  endDate: string | null;
  baseSalary: number;
  currency: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function EmploymentContractsClient() {
  const [employees, setEmployees] = useState<Option[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  const load = useCallback(async (empId: string) => {
    if (!empId) {
      setRows([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/hrm/employment-contracts?employeeId=${empId}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
  }, []);

  useEffect(() => {
    load(employeeId);
  }, [employeeId, load]);

  function openCreate() {
    setType("");
    setStartDate("");
    setEndDate("");
    setBaseSalary("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/hrm/employment-contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        type: type || undefined,
        startDate,
        endDate: endDate || undefined,
        baseSalary: Number(baseSalary) || 0,
      }),
    });
    const body = await res.json();
    if (!body.success) {
      setFormError(body.error?.message ?? "Có lỗi xảy ra");
      setSaving(false);
      return;
    }
    setSaving(false);
    setPanelOpen(false);
    load(employeeId);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Hợp đồng lao động</h1>
          <p className="mt-1 text-sm text-text-secondary">Lương cơ bản trên hợp đồng còn hiệu lực dùng để tự động tính bảng lương.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={!employeeId}>
          <Plus size={16} /> Thêm hợp đồng
        </Button>
      </div>

      <Card className="mb-6 max-w-md">
        <Label>Chọn nhân viên</Label>
        <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">-- Chọn nhân viên --</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {String(e.code)} - {String(e.fullName)}
            </option>
          ))}
        </Select>
      </Card>

      {employeeId && (
        <Card className="p-0">
          {loading ? (
            <EmptyState message="Đang tải..." />
          ) : rows.length === 0 ? (
            <EmptyState message="Nhân viên này chưa có hợp đồng nào" />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Loại hợp đồng</Th>
                  <Th>Ngày bắt đầu</Th>
                  <Th>Ngày kết thúc</Th>
                  <Th>Lương cơ bản</Th>
                </tr>
              </Thead>
              <tbody>
                {rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.type ?? "—"}</Td>
                    <Td>{row.startDate.slice(0, 10)}</Td>
                    <Td>{row.endDate ? row.endDate.slice(0, 10) : "Không xác định"}</Td>
                    <Td className="tabular-nums">
                      {row.baseSalary.toLocaleString("vi-VN")} {row.currency}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Thêm hợp đồng lao động</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>Loại hợp đồng</Label>
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Chính thức / Thử việc..." />
              </div>
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Ngày kết thúc (để trống nếu không xác định)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>Lương cơ bản (VND)</Label>
                <Input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !startDate || !baseSalary}>
                {saving ? "Đang lưu..." : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
