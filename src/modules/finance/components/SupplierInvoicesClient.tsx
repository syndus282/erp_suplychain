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
  currency: string;
  exchangeRate: number;
  amount: number;
  paidAmount: number;
  status: string;
  supplier: { name: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function SupplierInvoicesClient() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<Option[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [poId, setPoId] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/finance/supplier-invoices");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/procurement/suppliers?pageSize=200").then(setSuppliers);
    fetchOptions("/api/procurement/purchase-orders?pageSize=200").then(setPurchaseOrders);
  }, [load]);

  function openCreate() {
    setSupplierId("");
    setPoId("");
    setCurrency("VND");
    setExchangeRate("1");
    setAmount("");
    setDueDate("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/finance/supplier-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        poId: poId || undefined,
        currency,
        exchangeRate: Number(exchangeRate) || 1,
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
          <h1 className="text-xl font-semibold text-text-primary">Hóa đơn mua hàng (AP)</h1>
          <p className="mt-1 text-sm text-text-secondary">Ghi nhận công nợ phải trả — tự động sinh bút toán Nợ 156 / Có 331.</p>
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
                <Th>Nhà cung cấp</Th>
                <Th>Số tiền</Th>
                <Th>Đã trả</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có hóa đơn mua hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.supplier.name}</Td>
                    <Td className="tabular-nums">
                      {row.amount.toLocaleString("vi-VN")} {row.currency}
                    </Td>
                    <Td className="tabular-nums">
                      {row.paidAmount.toLocaleString("vi-VN")} {row.currency}
                    </Td>
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
              <h2 className="text-lg font-semibold text-text-primary">Ghi nhận hóa đơn mua hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>
                  Nhà cung cấp <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {String(s.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Đơn mua hàng liên quan</Label>
                <Select value={poId} onChange={(e) => setPoId(e.target.value)}>
                  <option value="">-- Không liên kết --</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {String(po.code)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tiền tệ</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                </div>
                <div>
                  <Label>Tỷ giá</Label>
                  <Input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>
                  Số tiền <span className="text-semantic-danger">*</span>
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
              <Button onClick={handleSubmit} disabled={saving || !supplierId || !amount}>
                {saving ? "Đang lưu..." : "Ghi nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
