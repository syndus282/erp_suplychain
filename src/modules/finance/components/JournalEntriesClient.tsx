"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Send, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface JeLine {
  id: string;
  debit: number;
  credit: number;
  account: { code: string; name: string };
}

interface JeRow {
  id: string;
  code: string;
  date: string;
  description: string | null;
  status: string;
  lines: JeLine[];
}

interface DraftLine {
  accountId: string;
  debit: string;
  credit: string;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function JournalEntriesClient() {
  const [rows, setRows] = useState<JeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Option[]>([]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { accountId: "", debit: "", credit: "" },
    { accountId: "", debit: "", credit: "" },
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/finance/journal-entries");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/finance/accounts?pageSize=200").then(setAccounts);
  }, [load]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function openCreate() {
    setDescription("");
    setLines([
      { accountId: "", debit: "", credit: "" },
      { accountId: "", debit: "", credit: "" },
    ]);
    setFormError(null);
    setPanelOpen(true);
  }

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const payload = {
      description: description || undefined,
      lines: lines
        .filter((l) => l.accountId)
        .map((l) => ({ accountId: l.accountId, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
    };

    const res = await fetch("/api/finance/journal-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  async function handleAction(id: string, action: "post" | "lock") {
    setActingId(id);
    const res = await fetch(`/api/finance/journal-entries/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Bút toán kế toán (GL)</h1>
          <p className="mt-1 text-sm text-text-secondary">Bút toán thủ công (điều chỉnh/phân bổ) — Nháp → Ghi sổ → Khóa sổ (không sửa được sau khi khóa).</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo bút toán
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số chứng từ</Th>
                <Th>Ngày</Th>
                <Th>Diễn giải</Th>
                <Th>Tổng tiền</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có bút toán nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const total = row.lines.reduce((s, l) => s + l.debit, 0);
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>{row.date.slice(0, 10)}</Td>
                      <Td>{row.description ?? "—"}</Td>
                      <Td className="tabular-nums">{total.toLocaleString("vi-VN")} ₫</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "DRAFT" && (
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "post")} className="gap-1 px-2 py-1 text-xs">
                              <Send size={14} /> Ghi sổ
                            </Button>
                          )}
                          {row.status === "POSTED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "lock")} className="gap-1 px-2 py-1 text-xs">
                              <Lock size={14} /> Khóa sổ
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
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo bút toán</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div>
              <Label>Diễn giải</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Dòng bút toán (Nợ/Có phải bằng nhau)</Label>
                <Button
                  variant="secondary"
                  onClick={() => setLines((prev) => [...prev, { accountId: "", debit: "", credit: "" }])}
                  className="gap-1 px-2 py-1 text-xs"
                >
                  <Plus size={14} /> Thêm dòng
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {lines.map((line, index) => (
                  <div key={index} className="flex items-end gap-2 rounded-lg border border-text-disabled/20 p-2">
                    <div className="flex-1">
                      <Label>Tài khoản</Label>
                      <Select value={line.accountId} onChange={(e) => updateLine(index, { accountId: e.target.value })}>
                        <option value="">-- Chọn tài khoản --</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {String(a.code)} - {String(a.name)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label>Nợ</Label>
                      <Input type="number" value={line.debit} onChange={(e) => updateLine(index, { debit: e.target.value, credit: "" })} />
                    </div>
                    <div className="w-32">
                      <Label>Có</Label>
                      <Input type="number" value={line.credit} onChange={(e) => updateLine(index, { credit: e.target.value, debit: "" })} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                      className="mb-2 rounded p-2 text-semantic-danger hover:bg-semantic-danger/10"
                      aria-label="Xóa dòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <p className={`mt-3 text-sm ${totalDebit === totalCredit ? "text-semantic-success" : "text-semantic-danger"}`}>
                Tổng Nợ: {totalDebit.toLocaleString("vi-VN")} ₫ — Tổng Có: {totalCredit.toLocaleString("vi-VN")} ₫
              </p>
            </div>

            {formError && <p className="mt-4 text-sm text-semantic-danger">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || totalDebit !== totalCredit || totalDebit === 0}>
                {saving ? "Đang lưu..." : "Tạo bút toán"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
