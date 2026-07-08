"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface InvoiceRow {
  id: string;
  code: string;
  amount: number;
  paidAmount: number;
  status: string;
  customer: { name: string };
  salesOrder: { code: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function CustomerInvoicesClient() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Option[]>([]);
  const [salesOrders, setSalesOrders] = useState<Option[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [soId, setSoId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/finance/customer-invoices");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
    fetchOptions("/api/sales/orders?pageSize=200").then(setSalesOrders);
  }, [load]);

  function openCreate() {
    setCustomerId("");
    setSoId("");
    setAmount("");
    setDueDate("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/finance/customer-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        soId: soId || undefined,
        amount: Number(amount) || 0,
        dueDate: dueDate || undefined,
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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Hóa đơn bán hàng (AR)</h1>
          <p className="mt-1 text-sm text-text-secondary">Ghi nhận doanh thu + công nợ phải thu — tự động sinh bút toán Nợ 131 / Có 511, cộng vào công nợ khách hàng.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Ghi nhận hóa đơn
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số hóa đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Đơn hàng gốc</Th>
                <Th>Số tiền</Th>
                <Th>Đã thu</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có hóa đơn bán hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.customer.name}</Td>
                    <Td>{row.salesOrder?.code ?? "—"}</Td>
                    <Td className="tabular-nums">{row.amount.toLocaleString("vi-VN")} ₫</Td>
                    <Td className="tabular-nums">{row.paidAmount.toLocaleString("vi-VN")} ₫</Td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Ghi nhận hóa đơn bán hàng</h2>
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
              <div>
                <Label>
                  Số tiền (VND) <span className="text-semantic-danger">*</span>
                </Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <Label>Hạn thanh toán</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !customerId || !amount}>
                {saving ? "Đang lưu..." : "Ghi nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
