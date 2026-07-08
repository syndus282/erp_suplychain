"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Search, Check, Ban, Wrench, Replace, Archive } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ClaimRow {
  id: string;
  code: string;
  status: string;
  description: string | null;
  customer: { name: string };
  registration: { product: { code: string; name: string }; serial: { serialNo: string } | null };
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function WarrantyClaimsClient() {
  const [rows, setRows] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [serials, setSerials] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);

  const [registrationId, setRegistrationId] = useState("");
  const [description, setDescription] = useState("");

  const [actionPanel, setActionPanel] = useState<{ type: "repair" | "replace"; row: ClaimRow } | null>(null);
  const [technicianId, setTechnicianId] = useState("");
  const [newSerialId, setNewSerialId] = useState("");
  const [actionWarehouseId, setActionWarehouseId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/claims");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/warranty/registrations?pageSize=200").then(setRegistrations);
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
    fetchOptions("/api/inventory/serial-numbers?pageSize=200").then((all) =>
      setSerials(all.filter((s) => s.status === "IN_STOCK"))
    );
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
  }, [load]);

  function openCreate() {
    setRegistrationId("");
    setDescription("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/warranty/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, description: description || undefined }),
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

  async function handleSimpleAction(id: string, action: "inspect" | "approve" | "reject" | "close") {
    setActingId(id);
    const res = await fetch(`/api/warranty/claims/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  function openAction(type: "repair" | "replace", row: ClaimRow) {
    setActionPanel({ type, row });
    setTechnicianId("");
    setNewSerialId("");
    setActionWarehouseId("");
    setActionError(null);
  }

  async function submitAction() {
    if (!actionPanel) return;
    setActingId(actionPanel.row.id);
    setActionError(null);
    const url = `/api/warranty/claims/${actionPanel.row.id}/${actionPanel.type}`;
    const payload = actionPanel.type === "repair" ? { technicianId: technicianId || undefined } : { newSerialId, warehouseId: actionWarehouseId };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await res.json();
    if (!body.success) {
      setActionError(body.error?.message ?? "Không thể thực hiện thao tác");
      setActingId(null);
      return;
    }
    setActingId(null);
    setActionPanel(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Yêu cầu bảo hành</h1>
          <p className="mt-1 text-sm text-text-secondary">Kiểm tra → Duyệt/Từ chối → Sửa chữa hoặc Đổi hàng mới → Đóng.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={registrations.length === 0}>
          <Plus size={16} /> Tạo yêu cầu bảo hành
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số yêu cầu</Th>
                <Th>Sản phẩm</Th>
                <Th>Khách hàng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có yêu cầu bảo hành nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>
                        {row.registration.product.code} - {row.registration.product.name}
                      </Td>
                      <Td>{row.customer.name}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {row.status === "OPEN" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleSimpleAction(row.id, "inspect")} className="gap-1 px-2 py-1 text-xs">
                              <Search size={14} /> Kiểm tra
                            </Button>
                          )}
                          {row.status === "INSPECTING" && (
                            <>
                              <Button variant="primary" disabled={busy} onClick={() => handleSimpleAction(row.id, "approve")} className="gap-1 px-2 py-1 text-xs">
                                <Check size={14} /> Duyệt
                              </Button>
                              <Button variant="danger" disabled={busy} onClick={() => handleSimpleAction(row.id, "reject")} className="gap-1 px-2 py-1 text-xs">
                                <Ban size={14} /> Từ chối
                              </Button>
                            </>
                          )}
                          {row.status === "APPROVED" && (
                            <>
                              <Button variant="secondary" disabled={busy} onClick={() => openAction("repair", row)} className="gap-1 px-2 py-1 text-xs">
                                <Wrench size={14} /> Sửa chữa
                              </Button>
                              <Button variant="secondary" disabled={busy} onClick={() => openAction("replace", row)} className="gap-1 px-2 py-1 text-xs">
                                <Replace size={14} /> Đổi hàng mới
                              </Button>
                            </>
                          )}
                          {(row.status === "REPAIRING" || row.status === "REPLACED") && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleSimpleAction(row.id, "close")} className="gap-1 px-2 py-1 text-xs">
                              <Archive size={14} /> Đóng
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo yêu cầu bảo hành</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>
                  Đăng ký bảo hành <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={registrationId} onChange={(e) => setRegistrationId(e.target.value)}>
                  <option value="">-- Chọn đăng ký bảo hành --</option>
                  {registrations.map((r) => {
                    const product = r.product as { code: string } | undefined;
                    return (
                      <option key={r.id} value={r.id}>
                        {product?.code ?? r.id}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div>
                <Label>Mô tả lỗi</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !registrationId}>
                {saving ? "Đang lưu..." : "Tạo yêu cầu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {actionPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {actionPanel.type === "repair" ? "Tạo lệnh sửa chữa" : "Đổi hàng mới"} — {actionPanel.row.code}
              </h2>
              <button type="button" onClick={() => setActionPanel(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            {actionPanel.type === "repair" ? (
              <div>
                <Label>Kỹ thuật viên</Label>
                <Select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
                  <option value="">-- Chưa phân công --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {String(e.fullName)}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <Label>
                    Serial hàng thay thế (đang trong kho) <span className="text-semantic-danger">*</span>
                  </Label>
                  <Select value={newSerialId} onChange={(e) => setNewSerialId(e.target.value)}>
                    <option value="">-- Chọn serial --</option>
                    {serials.map((s) => (
                      <option key={s.id} value={s.id}>
                        {String(s.serialNo)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>
                    Kho xuất hàng <span className="text-semantic-danger">*</span>
                  </Label>
                  <Select value={actionWarehouseId} onChange={(e) => setActionWarehouseId(e.target.value)}>
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {String(w.name)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {actionError && <p className="mt-3 text-sm text-semantic-danger">{actionError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActionPanel(null)}>
                Hủy
              </Button>
              <Button
                onClick={submitAction}
                disabled={actingId === actionPanel.row.id || (actionPanel.type === "replace" && (!newSerialId || !actionWarehouseId))}
              >
                {actingId === actionPanel.row.id ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
