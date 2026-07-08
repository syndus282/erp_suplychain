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

interface CommissionRow {
  id: string;
  amount: number;
  currency: string;
  period: string;
  employee: { code: string; fullName: string };
  salesOrder: { code: string } | null;
}

interface SalesOrderLine {
  totalAmount: number;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function CommissionsClient() {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Option[]>([]);
  const [salesOrders, setSalesOrders] = useState<Option[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [soId, setSoId] = useState("");
  const [ratePercent, setRatePercent] = useState("2");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hrm/commission-records");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
    fetchOptions("/api/sales/orders?pageSize=200").then(setSalesOrders);
  }, [load]);

  function openCreate() {
    setEmployeeId("");
    setSoId("");
    setRatePercent("2");
    setAmount("");
    setPeriod("");
    setFormError(null);
    setPanelOpen(true);
  }

  function selectedSoTotal(): number {
    const so = salesOrders.find((s) => s.id === soId);
    if (!so) return 0;
    const lines = (so.lines as SalesOrderLine[] | undefined) ?? [];
    return lines.reduce((sum, l) => sum + l.totalAmount, 0);
  }

  function applyComputedAmount() {
    const total = selectedSoTotal();
    const rate = Number(ratePercent) || 0;
    setAmount(String(Math.round((total * rate) / 100)));
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/hrm/commission-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, soId: soId || undefined, amount: Number(amount) || 0, period }),
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
          <h1 className="text-xl font-semibold text-text-primary">Hoa hồng bán hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">Ghi nhận hoa hồng theo đơn hàng — được cộng vào lương khi tính bảng lương cùng kỳ.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Ghi nhận hoa hồng
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
                <Th>Đơn hàng</Th>
                <Th>Kỳ</Th>
                <Th>Số tiền</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="Chưa có hoa hồng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>
                      {row.employee.code} - {row.employee.fullName}
                    </Td>
                    <Td>{row.salesOrder?.code ?? "—"}</Td>
                    <Td>{row.period}</Td>
                    <Td className="tabular-nums">
                      {row.amount.toLocaleString("vi-VN")} {row.currency}
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Ghi nhận hoa hồng</h2>
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
                <Label>Đơn hàng bán liên quan</Label>
                <Select value={soId} onChange={(e) => setSoId(e.target.value)}>
                  <option value="">-- Không liên kết --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {String(so.code)}
                    </option>
                  ))}
                </Select>
              </div>
              {soId && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>% hoa hồng trên giá trị đơn hàng</Label>
                    <Input type="number" value={ratePercent} onChange={(e) => setRatePercent(e.target.value)} />
                  </div>
                  <Button variant="secondary" onClick={applyComputedAmount} className="mb-0.5 text-xs">
                    Tính số tiền
                  </Button>
                </div>
              )}
              <div>
                <Label>
                  Số tiền (VND) <span className="text-semantic-danger">*</span>
                </Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <Label>
                  Kỳ lương (vd. 2026-07) <span className="text-semantic-danger">*</span>
                </Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-07" />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !employeeId || !amount || !period}>
                {saving ? "Đang lưu..." : "Ghi nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
