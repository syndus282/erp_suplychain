"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface AssetRow {
  id: string;
  code: string;
  name: string;
  purchaseDate: string;
  originalCost: number;
  usefulLifeMonths: number;
  currentValue: number;
}

export function FixedAssetsClient() {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [originalCost, setOriginalCost] = useState("");
  const [usefulLifeMonths, setUsefulLifeMonths] = useState("36");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/finance/fixed-assets");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setCode("");
    setName("");
    setPurchaseDate("");
    setOriginalCost("");
    setUsefulLifeMonths("36");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/finance/fixed-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        name,
        purchaseDate,
        originalCost: Number(originalCost) || 0,
        usefulLifeMonths: Number(usefulLifeMonths) || 1,
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

  async function handleDepreciate(id: string) {
    setActingId(id);
    const res = await fetch(`/api/finance/fixed-assets/${id}/depreciate`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể khấu hao");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Tài sản cố định</h1>
          <p className="mt-1 text-sm text-text-secondary">Khấu hao đường thẳng — mỗi lần bấm trừ đúng 1 kỳ theo (Nguyên giá / Thời gian sử dụng).</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Thêm tài sản
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Mã</Th>
                <Th>Tên tài sản</Th>
                <Th>Nguyên giá</Th>
                <Th>Thời gian sử dụng</Th>
                <Th>Giá trị còn lại</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có tài sản nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.name}</Td>
                    <Td className="tabular-nums">{row.originalCost.toLocaleString("vi-VN")} ₫</Td>
                    <Td>{row.usefulLifeMonths} tháng</Td>
                    <Td className="tabular-nums">{row.currentValue.toLocaleString("vi-VN")} ₫</Td>
                    <Td>
                      <Button
                        variant="secondary"
                        disabled={actingId === row.id || row.currentValue <= 0}
                        onClick={() => handleDepreciate(row.id)}
                        className="gap-1 px-2 py-1 text-xs"
                      >
                        <TrendingDown size={14} /> Khấu hao 1 kỳ
                      </Button>
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
              <h2 className="text-lg font-semibold text-text-primary">Thêm tài sản cố định</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>Mã tài sản</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <Label>Tên tài sản</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Ngày mua</Label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
              <div>
                <Label>Nguyên giá (VND)</Label>
                <Input type="number" value={originalCost} onChange={(e) => setOriginalCost(e.target.value)} />
              </div>
              <div>
                <Label>Thời gian sử dụng (tháng)</Label>
                <Input type="number" value={usefulLifeMonths} onChange={(e) => setUsefulLifeMonths(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !code || !name || !purchaseDate || !originalCost}>
                {saving ? "Đang lưu..." : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
