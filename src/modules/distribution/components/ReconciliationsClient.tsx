"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ReconciliationRow {
  id: string;
  periodFrom: string;
  periodTo: string;
  systemQty: number;
  dealerReportedQty: number;
  varianceQty: number;
  status: string;
  dealer: { name: string };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function ReconciliationsClient() {
  const [rows, setRows] = useState<ReconciliationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [dealers, setDealers] = useState<Option[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [dealerReportedQty, setDealerReportedQty] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/distribution/consignment-reconciliations");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/distribution/customers?type=DEALER").then(setDealers);
  }, [load]);

  function openCreate() {
    setDealerId("");
    setPeriodFrom("");
    setPeriodTo("");
    setDealerReportedQty("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/distribution/consignment-reconciliations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealerId, periodFrom, periodTo, dealerReportedQty: Number(dealerReportedQty) || 0 }),
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

  async function handleResolve(id: string) {
    setActingId(id);
    const res = await fetch(`/api/distribution/consignment-reconciliations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể cập nhật");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Đối soát ký gửi</h1>
          <p className="mt-1 text-sm text-text-secondary">
            So sánh tồn hệ thống (ConsignmentBalance) với số đại lý báo cáo theo từng kỳ.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo đối soát
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Đại lý</Th>
                <Th>Kỳ</Th>
                <Th>Hệ thống</Th>
                <Th>Đại lý báo cáo</Th>
                <Th>Chênh lệch</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="Chưa có đối soát nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.dealer.name}</Td>
                    <Td>
                      {new Date(row.periodFrom).toLocaleDateString("vi-VN")} - {new Date(row.periodTo).toLocaleDateString("vi-VN")}
                    </Td>
                    <Td className="tabular-nums">{row.systemQty}</Td>
                    <Td className="tabular-nums">{row.dealerReportedQty}</Td>
                    <Td className={`tabular-nums font-medium ${row.varianceQty !== 0 ? "text-semantic-danger" : "text-semantic-success"}`}>
                      {row.varianceQty > 0 ? `+${row.varianceQty}` : row.varianceQty}
                      {row.varianceQty !== 0 && <AlertTriangle size={12} className="ml-1 inline" />}
                    </Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      {row.status === "OPEN" && (
                        <Button variant="secondary" disabled={actingId === row.id} onClick={() => handleResolve(row.id)} className="gap-1 px-2 py-1 text-xs">
                          <CheckCircle2 size={14} /> Đã xử lý
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-md overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo đối soát ký gửi</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label>
                  Đại lý <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={dealerId} onChange={(e) => setDealerId(e.target.value)}>
                  <option value="">-- Chọn đại lý --</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {String(d.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Từ ngày</Label>
                <Input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
              </div>
              <div>
                <Label>Số lượng đại lý báo cáo còn tồn</Label>
                <Input type="number" value={dealerReportedQty} onChange={(e) => setDealerReportedQty(e.target.value)} />
              </div>

              {formError && <p className="text-sm text-semantic-danger">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={saving || !dealerId || !periodFrom || !periodTo}>
                  {saving ? "Đang lưu..." : "Tạo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
