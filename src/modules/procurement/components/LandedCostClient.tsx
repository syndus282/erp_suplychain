"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calculator } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

const COST_TYPE_OPTIONS = [
  { value: "PURCHASE_PRICE", label: "Giá mua" },
  { value: "ENTRUSTED_FEE", label: "Phí ủy thác" },
  { value: "INTL_FREIGHT", label: "Cước vận chuyển quốc tế" },
  { value: "DOMESTIC_FREIGHT", label: "Cước vận chuyển nội địa" },
  { value: "INSURANCE", label: "Bảo hiểm" },
  { value: "IMPORT_TAX", label: "Thuế nhập khẩu" },
  { value: "HANDLING", label: "Phí bốc xếp/kho bãi" },
  { value: "OTHER", label: "Khác" },
];

const ALLOCATION_METHOD_OPTIONS = [
  { value: "BY_VALUE", label: "Theo giá trị dòng hàng" },
  { value: "BY_QTY", label: "Theo số lượng" },
];

interface Allocation {
  id: string;
  allocatedAmount: number;
  poLine: { product: { code: string; name: string } };
}

interface LandedCostRow {
  id: string;
  costType: string;
  amount: number;
  currency: string;
  allocationMethod: string;
  allocations: Allocation[];
}

export function LandedCostClient({ shipmentId }: { shipmentId: string }) {
  const [rows, setRows] = useState<LandedCostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [costType, setCostType] = useState("PURCHASE_PRICE");
  const [amount, setAmount] = useState("");
  const [allocationMethod, setAllocationMethod] = useState("BY_VALUE");
  const [saving, setSaving] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/procurement/landed-costs?shipmentId=${shipmentId}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [shipmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/procurement/landed-costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId, costType, amount: Number(amount) || 0, allocationMethod }),
    });
    const body = await res.json();
    if (!body.success) {
      setError(body.error?.message ?? "Có lỗi xảy ra");
      setSaving(false);
      return;
    }
    setAmount("");
    setSaving(false);
    load();
  }

  async function handleAllocate() {
    setAllocating(true);
    setError(null);
    const res = await fetch(`/api/procurement/landed-costs/${shipmentId}/allocate`, { method: "POST" });
    const body = await res.json();
    if (!body.success) {
      setError(body.error?.message ?? "Không thể phân bổ chi phí");
      setAllocating(false);
      return;
    }
    setAllocating(false);
    load();
  }

  return (
    <div>
      <Link href="/procurement/import-shipments" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Quay lại danh sách lô hàng
      </Link>

      <h1 className="mb-2 text-xl font-semibold text-text-primary">Chi phí nhập khẩu (Landed Cost)</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Ghi nhận từng khoản chi phí rồi bấm &quot;Phân bổ&quot; để tính lại giá vốn thực tế/SKU theo phương pháp đã chọn.
      </p>

      <Card className="mb-6">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label>Loại chi phí</Label>
            <Select value={costType} onChange={(e) => setCostType(e.target.value)}>
              {COST_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Số tiền (VND)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Phương pháp phân bổ</Label>
            <Select value={allocationMethod} onChange={(e) => setAllocationMethod(e.target.value)}>
              {ALLOCATION_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={saving || !amount} className="w-full gap-1.5">
              <Plus size={16} /> Thêm chi phí
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-semantic-danger">{error}</p>}
      </Card>

      <div className="mb-4 flex justify-end">
        <Button onClick={handleAllocate} disabled={allocating || rows.length === 0} variant="secondary" className="gap-1.5">
          <Calculator size={16} /> {allocating ? "Đang phân bổ..." : "Phân bổ chi phí vào dòng hàng"}
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có chi phí nào được ghi nhận" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Loại chi phí</Th>
                <Th>Số tiền</Th>
                <Th>Phương pháp</Th>
                <Th>Đã phân bổ</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{COST_TYPE_OPTIONS.find((o) => o.value === row.costType)?.label ?? row.costType}</Td>
                  <Td className="tabular-nums">{row.amount.toLocaleString("vi-VN")} ₫</Td>
                  <Td>{ALLOCATION_METHOD_OPTIONS.find((o) => o.value === row.allocationMethod)?.label}</Td>
                  <Td>
                    {row.allocations.length === 0 ? (
                      <span className="text-text-secondary">Chưa phân bổ</span>
                    ) : (
                      <ul className="text-xs text-text-secondary">
                        {row.allocations.map((a) => (
                          <li key={a.id}>
                            {a.poLine.product.code}: {a.allocatedAmount.toLocaleString("vi-VN")} ₫
                          </li>
                        ))}
                      </ul>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
