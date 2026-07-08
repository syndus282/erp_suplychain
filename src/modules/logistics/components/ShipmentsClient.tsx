"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Truck, Ban } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface ShipmentLine {
  id: string;
  qty: number;
  product: { code: string; name: string };
}

interface ShipmentRow {
  id: string;
  code: string;
  status: string;
  warehouse: { name: string };
  vehicle: { plateNumber: string } | null;
  driver: { employee: { fullName: string } } | null;
  carrier: { name: string } | null;
  lines: ShipmentLine[];
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function ShipmentsClient() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [vehicles, setVehicles] = useState<Option[]>([]);
  const [drivers, setDrivers] = useState<Option[]>([]);
  const [carriers, setCarriers] = useState<Option[]>([]);
  const [draftRequests, setDraftRequests] = useState<Option[]>([]);

  const [warehouseId, setWarehouseId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [deliveryRequestIds, setDeliveryRequestIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/logistics/shipments");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  const loadDraftRequests = useCallback(async () => {
    const all = await fetchOptions("/api/logistics/delivery-requests?pageSize=200");
    setDraftRequests(all.filter((r) => r.status === "DRAFT"));
  }, []);

  useEffect(() => {
    load();
    loadDraftRequests();
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/logistics/vehicles?pageSize=100").then(setVehicles);
    fetchOptions("/api/logistics/drivers?pageSize=100").then(setDrivers);
    fetchOptions("/api/logistics/carriers?pageSize=100").then(setCarriers);
  }, [load, loadDraftRequests]);

  function openCreate() {
    setWarehouseId("");
    setVehicleId("");
    setDriverId("");
    setCarrierId("");
    setDeliveryRequestIds([]);
    setFormError(null);
    loadDraftRequests();
    setPanelOpen(true);
  }

  function toggleRequest(id: string) {
    setDeliveryRequestIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/logistics/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId,
        vehicleId: vehicleId || undefined,
        driverId: driverId || undefined,
        carrierId: carrierId || undefined,
        deliveryRequestIds,
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

  async function handleAction(id: string, action: "dispatch" | "close") {
    setActingId(id);
    const res = await fetch(`/api/logistics/shipments/${id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể thực hiện thao tác");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Chuyến giao hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">Gom yêu cầu giao hàng vào 1 chuyến → Xuất kho → Ghi nhận bằng chứng giao hàng (POD) → Đóng chuyến.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={draftRequests.length === 0}>
          <Plus size={16} /> Tạo chuyến hàng
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Mã chuyến</Th>
                <Th>Kho xuất</Th>
                <Th>Xe / Tài xế / ĐVVC</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có chuyến hàng nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const busy = actingId === row.id;
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <Link href={`/logistics/shipments/${row.id}`} className="text-brand-primary hover:underline">
                          {row.code}
                        </Link>
                      </Td>
                      <Td>{row.warehouse.name}</Td>
                      <Td className="text-xs text-text-secondary">
                        {row.vehicle?.plateNumber ?? "—"} / {row.driver?.employee.fullName ?? "—"} / {row.carrier?.name ?? "—"}
                      </Td>
                      <Td>{row.lines.length}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          {row.status === "PLANNED" && (
                            <Button variant="primary" disabled={busy} onClick={() => handleAction(row.id, "dispatch")} className="gap-1 px-2 py-1 text-xs">
                              <Truck size={14} /> Xuất kho
                            </Button>
                          )}
                          {row.status === "DELIVERED" && (
                            <Button variant="secondary" disabled={busy} onClick={() => handleAction(row.id, "close")} className="gap-1 px-2 py-1 text-xs">
                              <Ban size={14} /> Đóng chuyến
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
              <h2 className="text-lg font-semibold text-text-primary">Tạo chuyến hàng</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Kho xuất hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {String(w.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Xe (nội bộ)</Label>
                <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                  <option value="">-- Không dùng --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {String(v.plateNumber)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Tài xế</Label>
                <Select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                  <option value="">-- Không dùng --</option>
                  {drivers.map((d) => {
                    const employee = d.employee as { fullName: string } | undefined;
                    return (
                      <option key={d.id} value={d.id}>
                        {employee?.fullName ?? d.id}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div>
                <Label>Đơn vị vận chuyển ngoài</Label>
                <Select value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
                  <option value="">-- Không dùng --</option>
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {String(c.name)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <Label>
                Yêu cầu giao hàng (chọn để gom vào chuyến) <span className="text-semantic-danger">*</span>
              </Label>
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-text-disabled/20 p-2">
                {draftRequests.length === 0 ? (
                  <p className="p-2 text-sm text-text-secondary">Không có yêu cầu giao hàng nào đang chờ gom chuyến.</p>
                ) : (
                  draftRequests.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 rounded p-1.5 text-sm hover:bg-surface-glass">
                      <input
                        type="checkbox"
                        checked={deliveryRequestIds.includes(r.id)}
                        onChange={() => toggleRequest(r.id)}
                        className="h-4 w-4 rounded border-text-disabled/40"
                      />
                      {String(r.code)}
                    </label>
                  ))
                )}
              </div>
            </div>

            {formError && <p className="mt-4 text-sm text-semantic-danger">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !warehouseId || deliveryRequestIds.length === 0}>
                {saving ? "Đang lưu..." : "Tạo chuyến"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
