"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

const TYPE_OPTIONS = [
  { value: "DEALER", label: "Đại lý" },
  { value: "GARAGE", label: "Garage" },
  { value: "DISTRIBUTOR", label: "Nhà phân phối" },
  { value: "ENTERPRISE", label: "Khách hàng doanh nghiệp" },
  { value: "RETAIL", label: "Khách lẻ" },
];

const TIER_OPTIONS = [
  { value: "PLATINUM", label: "Platinum" },
  { value: "GOLD", label: "Gold" },
  { value: "SILVER", label: "Silver" },
  { value: "STANDARD", label: "Standard" },
];

interface CustomerRow {
  id: string;
  code: string;
  name: string;
  type: string;
  region: string | null;
  creditLimit: number;
  status: string;
  dealerProfile: { tier: string } | null;
}

export function CustomersClient() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("DEALER");
  const [region, setRegion] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [tier, setTier] = useState("STANDARD");
  const [contractNumber, setContractNumber] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/distribution/customers?${params}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setCode("");
    setName("");
    setType("DEALER");
    setRegion("");
    setCreditLimit("");
    setTier("STANDARD");
    setContractNumber("");
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(row: CustomerRow) {
    setEditing(row);
    setCode(row.code);
    setName(row.name);
    setType(row.type);
    setRegion(row.region ?? "");
    setCreditLimit(String(row.creditLimit ?? 0));
    setTier(row.dealerProfile?.tier ?? "STANDARD");
    setContractNumber("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const payload: Record<string, unknown> = {
      code,
      name,
      type,
      region: region || undefined,
      creditLimit: Number(creditLimit) || 0,
    };
    if (type === "DEALER") {
      payload.dealerProfile = { tier, contractNumber: contractNumber || undefined };
    }

    const url = editing ? `/api/distribution/customers/${editing.id}` : "/api/distribution/customers";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
          <h1 className="text-xl font-semibold text-text-primary">Khách hàng / Đại lý</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Đại lý (type=DEALER) có thêm hồ sơ ký gửi (cấp bậc, hợp đồng) bên dưới.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Thêm mới
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input placeholder="Tìm theo mã hoặc tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Mã KH</Th>
                <Th>Tên</Th>
                <Th>Loại</Th>
                <Th>Cấp đại lý</Th>
                <Th>Khu vực</Th>
                <Th>Hạn mức tín dụng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="Chưa có khách hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.name}</Td>
                    <Td>{TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type}</Td>
                    <Td>{row.dealerProfile?.tier ?? "—"}</Td>
                    <Td>{row.region ?? "—"}</Td>
                    <Td className="tabular-nums">{row.creditLimit.toLocaleString("vi-VN")} ₫</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      <button onClick={() => openEdit(row)} className="rounded p-1 text-text-secondary hover:bg-surface-glass hover:text-brand-primary" aria-label="Sửa">
                        <Pencil size={16} />
                      </button>
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
              <h2 className="text-lg font-semibold text-text-primary">{editing ? "Sửa" : "Thêm"} khách hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label>Mã khách hàng</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <Label>Tên khách hàng</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Loại</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Khu vực</Label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>
              <div>
                <Label>Hạn mức tín dụng (VND)</Label>
                <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
              </div>

              {type === "DEALER" && (
                <>
                  <div>
                    <Label>Cấp đại lý</Label>
                    <Select value={tier} onChange={(e) => setTier(e.target.value)}>
                      {TIER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Số hợp đồng ký gửi</Label>
                    <Input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} />
                  </div>
                </>
              )}

              {formError && <p className="text-sm text-semantic-danger">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={saving || !code || !name}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
