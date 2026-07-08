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

interface PaymentRow {
  id: string;
  code: string;
  direction: string;
  partnerType: string;
  amount: number;
  currency: string;
  method: string | null;
  paidAt: string;
  bankAccount: { bankName: string; accountNo: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function PaymentsClient() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [supplierInvoices, setSupplierInvoices] = useState<Option[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<Option[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Option[]>([]);

  const [direction, setDirection] = useState<"OUT" | "IN">("OUT");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [method, setMethod] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/finance/payments");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  const loadInvoices = useCallback(async () => {
    fetchOptions("/api/finance/supplier-invoices?pageSize=200").then((all) =>
      setSupplierInvoices(all.filter((i) => i.status !== "PAID"))
    );
    fetchOptions("/api/finance/customer-invoices?pageSize=200").then((all) =>
      setCustomerInvoices(all.filter((i) => i.status !== "PAID"))
    );
  }, []);

  useEffect(() => {
    load();
    loadInvoices();
    fetchOptions("/api/finance/bank-accounts?pageSize=100").then(setBankAccounts);
  }, [load, loadInvoices]);

  function openCreate() {
    setDirection("OUT");
    setInvoiceId("");
    setAmount("");
    setExchangeRate("");
    setBankAccountId("");
    setMethod("");
    setFormError(null);
    loadInvoices();
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/finance/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction,
        invoiceId,
        amount: Number(amount) || 0,
        exchangeRate: direction === "OUT" && exchangeRate ? Number(exchangeRate) : undefined,
        bankAccountId: bankAccountId || undefined,
        method: method || undefined,
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

  const invoiceOptions = direction === "OUT" ? supplierInvoices : customerInvoices;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Thu / Chi</h1>
          <p className="mt-1 text-sm text-text-secondary">Chi trả hóa đơn mua hàng hoặc thu tiền hóa đơn bán hàng — tự động cập nhật công nợ và bút toán (kèm chênh lệch tỷ giá nếu có).</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo phiếu thu/chi
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số phiếu</Th>
                <Th>Loại</Th>
                <Th>Đối tượng</Th>
                <Th>Số tiền</Th>
                <Th>Phương thức</Th>
                <Th>Ngày</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có phiếu thu/chi nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.direction === "IN" ? "Thu" : "Chi"}</Td>
                    <Td>{row.partnerType === "SUPPLIER" ? "Nhà cung cấp" : "Khách hàng"}</Td>
                    <Td className="tabular-nums">
                      {row.amount.toLocaleString("vi-VN")} {row.currency}
                    </Td>
                    <Td>{row.method ?? (row.bankAccount ? `${row.bankAccount.bankName}` : "Tiền mặt")}</Td>
                    <Td>{row.paidAt.slice(0, 10)}</Td>
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo phiếu thu/chi</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>Loại</Label>
                <Select
                  value={direction}
                  onChange={(e) => {
                    setDirection(e.target.value as "OUT" | "IN");
                    setInvoiceId("");
                  }}
                >
                  <option value="OUT">Chi — thanh toán hóa đơn mua hàng</option>
                  <option value="IN">Thu — thu tiền hóa đơn bán hàng</option>
                </Select>
              </div>
              <div>
                <Label>
                  Hóa đơn <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                  <option value="">-- Chọn hóa đơn còn nợ --</option>
                  {invoiceOptions.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {String(inv.code)} ({Number(inv.amount) - Number(inv.paidAmount)} còn lại)
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Số tiền <span className="text-semantic-danger">*</span>
                </Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              {direction === "OUT" && (
                <div>
                  <Label>Tỷ giá thanh toán (để trống = dùng tỷ giá hóa đơn)</Label>
                  <Input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
                </div>
              )}
              <div>
                <Label>Tài khoản ngân hàng (để trống = tiền mặt)</Label>
                <Select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                  <option value="">-- Tiền mặt --</option>
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {String(b.bankName)} - {String(b.accountNo)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Phương thức</Label>
                <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Tiền mặt / Chuyển khoản..." />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !invoiceId || !amount}>
                {saving ? "Đang lưu..." : "Tạo phiếu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
