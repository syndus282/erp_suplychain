"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Check, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface PayrollRow {
  id: string;
  period: string;
  baseSalary: number;
  allowance: number;
  bonus: number;
  commission: number;
  otAmount: number;
  insuranceDeduction: number;
  taxDeduction: number;
  netAmount: number;
  currency: string;
  status: string;
  employee: { code: string; fullName: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function PayrollClient() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Option[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [period, setPeriod] = useState("");
  const [allowance, setAllowance] = useState("0");
  const [bonus, setBonus] = useState("0");
  const [insuranceDeduction, setInsuranceDeduction] = useState("0");
  const [taxDeduction, setTaxDeduction] = useState("0");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hrm/payroll");
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
    setPeriod("");
    setAllowance("0");
    setBonus("0");
    setInsuranceDeduction("0");
    setTaxDeduction("0");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/hrm/payroll/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        period,
        allowance: Number(allowance) || 0,
        bonus: Number(bonus) || 0,
        insuranceDeduction: Number(insuranceDeduction) || 0,
        taxDeduction: Number(taxDeduction) || 0,
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
    load();
  }

  async function handleAction(id: string, action: "confirm" | "pay") {
    setActingId(id);
    const res = await fetch(`/api/hrm/payroll/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Bảng lương</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Tính lương = lương cơ bản (theo hợp đồng) + phụ cấp + thưởng + hoa hồng (theo kỳ) + tăng ca (tự tính từ chấm công) − bảo hiểm − thuế. Nháp → Xác nhận → Trả lương (ghi bút toán 642/111).
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tính lương
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
                <Th>Kỳ</Th>
                <Th>Lương cơ bản</Th>
                <Th>Hoa hồng</Th>
                <Th>Tăng ca</Th>
                <Th>Thực lãnh</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="Chưa có bảng lương nào" />
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
                      <Td>{row.period}</Td>
                      <Td className="tabular-nums">{row.baseSalary.toLocaleString("vi-VN")}</Td>
                      <Td className="tabular-nums">{row.commission.toLocaleString("vi-VN")}</Td>
                      <Td className="tabular-nums">{row.otAmount.toLocaleString("vi-VN")}</Td>
                      <Td className="tabular-nums font-medium">
                        {row.netAmount.toLocaleString("vi-VN")} {row.currency}
                      </Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "DRAFT" && (
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "confirm")} className="gap-1 px-2 py-1 text-xs">
                              <Check size={14} /> Xác nhận
                            </Button>
                          )}
                          {row.status === "CONFIRMED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "pay")} className="gap-1 px-2 py-1 text-xs">
                              <Wallet size={14} /> Trả lương
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
              <h2 className="text-lg font-semibold text-text-primary">Tính bảng lương</h2>
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
                <Label>
                  Kỳ lương (YYYY-MM) <span className="text-semantic-danger">*</span>
                </Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-07" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phụ cấp</Label>
                  <Input type="number" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
                </div>
                <div>
                  <Label>Thưởng</Label>
                  <Input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} />
                </div>
                <div>
                  <Label>Bảo hiểm trừ</Label>
                  <Input type="number" value={insuranceDeduction} onChange={(e) => setInsuranceDeduction(e.target.value)} />
                </div>
                <div>
                  <Label>Thuế TNCN trừ</Label>
                  <Input type="number" value={taxDeduction} onChange={(e) => setTaxDeduction(e.target.value)} />
                </div>
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !employeeId || !period}>
                {saving ? "Đang tính..." : "Tính lương"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
