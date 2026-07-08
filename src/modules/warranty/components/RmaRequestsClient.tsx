"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Check, Ban, PackageCheck, ClipboardCheck, Wrench, Replace } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface RmaRow {
  id: string;
  code: string;
  status: string;
  claim: { code: string } | null;
  salesReturn: { code: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function RmaRequestsClient() {
  const [rows, setRows] = useState<RmaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [claims, setClaims] = useState<Option[]>([]);
  const [salesReturns, setSalesReturns] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);

  const [sourceType, setSourceType] = useState<"claim" | "salesReturn">("claim");
  const [claimId, setClaimId] = useState("");
  const [salesReturnId, setSalesReturnId] = useState("");

  const [receivePanelRow, setReceivePanelRow] = useState<RmaRow | null>(null);
  const [receiveWarehouseId, setReceiveWarehouseId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/rma-requests");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/warranty/claims?pageSize=200").then((all) => setClaims(all.filter((c) => c.status === "APPROVED")));
    fetchOptions("/api/sales/returns?pageSize=200").then(setSalesReturns);
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
  }, [load]);

  function openCreate() {
    setSourceType("claim");
    setClaimId("");
    setSalesReturnId("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const payload = sourceType === "claim" ? { claimId } : { salesReturnId };
    const res = await fetch("/api/warranty/rma-requests", {
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

  async function handleSimpleAction(id: string, action: "approve" | "reject" | "qc" | "repair" | "replace") {
    setActingId(id);
    const res = await fetch(`/api/warranty/rma-requests/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  async function submitReceive() {
    if (!receivePanelRow) return;
    setActingId(receivePanelRow.id);
    setActionError(null);
    const res = await fetch(`/api/warranty/rma-requests/${receivePanelRow.id}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId: receiveWarehouseId }),
    });
    const body = await res.json();
    if (!body.success) {
      setActionError(body.error?.message ?? "Không thể nhận hàng");
      setActingId(null);
      return;
    }
    setActingId(null);
    setReceivePanelRow(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">RMA — Thu hồi hàng lỗi</h1>
          <p className="mt-1 text-sm text-text-secondary">Yêu cầu → Duyệt → Nhận hàng (nhập kho bảo hành) → QC → Sửa chữa/Đổi hàng.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Tạo RMA
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số RMA</Th>
                <Th>Nguồn</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="Chưa có RMA nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>{row.code}</Td>
                      <Td>{row.claim ? `Bảo hành ${row.claim.code}` : `Trả hàng ${row.salesReturn?.code}`}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {row.status === "REQUESTED" && (
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
                            <Button
                              variant="secondary"
                              disabled={busy}
                              onClick={() => {
                                setReceivePanelRow(row);
                                setReceiveWarehouseId("");
                                setActionError(null);
                              }}
                              className="gap-1 px-2 py-1 text-xs"
                            >
                              <PackageCheck size={14} /> Nhận hàng
                            </Button>
                          )}
                          {row.status === "RECEIVED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleSimpleAction(row.id, "qc")} className="gap-1 px-2 py-1 text-xs">
                              <ClipboardCheck size={14} /> QC xong
                            </Button>
                          )}
                          {row.status === "QC_DONE" && (
                            <>
                              <Button variant="secondary" disabled={busy} onClick={() => handleSimpleAction(row.id, "repair")} className="gap-1 px-2 py-1 text-xs">
                                <Wrench size={14} /> Sửa chữa
                              </Button>
                              <Button variant="secondary" disabled={busy} onClick={() => handleSimpleAction(row.id, "replace")} className="gap-1 px-2 py-1 text-xs">
                                <Replace size={14} /> Đổi hàng
                              </Button>
                            </>
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo RMA</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <Label>Nguồn</Label>
                <Select value={sourceType} onChange={(e) => setSourceType(e.target.value as "claim" | "salesReturn")}>
                  <option value="claim">Từ yêu cầu bảo hành</option>
                  <option value="salesReturn">Từ phiếu trả hàng</option>
                </Select>
              </div>
              {sourceType === "claim" ? (
                <div>
                  <Label>Yêu cầu bảo hành (đã duyệt)</Label>
                  <Select value={claimId} onChange={(e) => setClaimId(e.target.value)}>
                    <option value="">-- Chọn --</option>
                    {claims.map((c) => (
                      <option key={c.id} value={c.id}>
                        {String(c.code)}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Phiếu trả hàng</Label>
                  <Select value={salesReturnId} onChange={(e) => setSalesReturnId(e.target.value)}>
                    <option value="">-- Chọn --</option>
                    {salesReturns.map((sr) => (
                      <option key={sr.id} value={sr.id}>
                        {String(sr.code)}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || (sourceType === "claim" ? !claimId : !salesReturnId)}>
                {saving ? "Đang lưu..." : "Tạo RMA"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {receivePanelRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Nhận hàng {receivePanelRow.code}</h2>
              <button type="button" onClick={() => setReceivePanelRow(null)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>
            <Label>
              Kho nhận hàng <span className="text-semantic-danger">*</span>
            </Label>
            <Select value={receiveWarehouseId} onChange={(e) => setReceiveWarehouseId(e.target.value)}>
              <option value="">-- Chọn kho --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {String(w.name)}
                </option>
              ))}
            </Select>
            {actionError && <p className="mt-3 text-sm text-semantic-danger">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setReceivePanelRow(null)}>
                Hủy
              </Button>
              <Button onClick={submitReceive} disabled={actingId === receivePanelRow.id || !receiveWarehouseId}>
                {actingId === receivePanelRow.id ? "Đang xử lý..." : "Xác nhận nhận hàng"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
