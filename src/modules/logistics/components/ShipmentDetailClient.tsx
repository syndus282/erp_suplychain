"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

const COST_TYPE_OPTIONS = [
  { value: "FUEL", label: "Xăng dầu" },
  { value: "TOLL", label: "Phí cầu đường" },
  { value: "THIRD_PARTY_CARRIER", label: "Thuê ngoài" },
  { value: "LOADING", label: "Bốc xếp" },
  { value: "OTHER", label: "Khác" },
];

interface ShipmentLine {
  id: string;
  qty: number;
  product: { code: string; name: string };
  deliveryRequest: { code: string };
}

interface Pod {
  id: string;
  receivedByName: string | null;
  receivedAt: string;
  note: string | null;
}

interface Cost {
  id: string;
  type: string;
  amount: number;
  currency: string;
}

interface ShipmentDetail {
  id: string;
  code: string;
  status: string;
  warehouse: { name: string };
  lines: ShipmentLine[];
  proofsOfDelivery: Pod[];
  costs: Cost[];
}

export function ShipmentDetailClient({ shipmentId }: { shipmentId: string }) {
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [podOpen, setPodOpen] = useState(false);
  const [receivedByName, setReceivedByName] = useState("");
  const [note, setNote] = useState("");
  const [podSaving, setPodSaving] = useState(false);
  const [podError, setPodError] = useState<string | null>(null);

  const [costType, setCostType] = useState("FUEL");
  const [costAmount, setCostAmount] = useState("");
  const [costSaving, setCostSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/logistics/shipments`);
    const body = await res.json();
    if (body.success) {
      const found = body.data.find((s: ShipmentDetail) => s.id === shipmentId);
      setShipment(found ?? null);
    }
    setLoading(false);
  }, [shipmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitPod() {
    setPodSaving(true);
    setPodError(null);
    const res = await fetch(`/api/logistics/shipments/${shipmentId}/pod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receivedByName: receivedByName || undefined, note: note || undefined }),
    });
    const body = await res.json();
    if (!body.success) {
      setPodError(body.error?.message ?? "Không thể ghi nhận POD");
      setPodSaving(false);
      return;
    }
    setPodSaving(false);
    setPodOpen(false);
    load();
  }

  async function addCost() {
    setCostSaving(true);
    await fetch("/api/logistics/delivery-costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId, type: costType, amount: Number(costAmount) || 0 }),
    });
    setCostAmount("");
    setCostSaving(false);
    load();
  }

  if (loading) return <EmptyState message="Đang tải..." />;
  if (!shipment) return <EmptyState message="Không tìm thấy chuyến hàng" />;

  return (
    <div>
      <Link href="/logistics/shipments" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Quay lại danh sách chuyến hàng
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Chuyến hàng {shipment.code}</h1>
          <p className="mt-1 text-sm text-text-secondary">Kho xuất: {shipment.warehouse.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={shipment.status} />
          {shipment.status === "ON_DELIVERY" && (
            <Button onClick={() => setPodOpen(true)} className="gap-1.5">
              <ClipboardCheck size={16} /> Ghi nhận POD
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6 p-0">
        <Table>
          <Thead>
            <tr>
              <Th>Yêu cầu giao</Th>
              <Th>Sản phẩm</Th>
              <Th>Số lượng</Th>
            </tr>
          </Thead>
          <tbody>
            {shipment.lines.map((line) => (
              <Tr key={line.id}>
                <Td>{line.deliveryRequest.code}</Td>
                <Td>
                  {line.product.code} - {line.product.name}
                </Td>
                <Td>{line.qty}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Bằng chứng giao hàng (POD)</h2>
          {shipment.proofsOfDelivery.length === 0 ? (
            <p className="text-sm text-text-secondary">Chưa có bằng chứng giao hàng.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {shipment.proofsOfDelivery.map((p) => (
                <li key={p.id} className="rounded-lg border border-text-disabled/20 p-2">
                  <p className="font-medium text-text-primary">{p.receivedByName ?? "Không rõ người nhận"}</p>
                  <p className="text-xs text-text-secondary">{new Date(p.receivedAt).toLocaleString("vi-VN")}</p>
                  {p.note && <p className="mt-1 text-xs text-text-secondary">{p.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Chi phí giao hàng</h2>
          <div className="mb-3 flex gap-2">
            <Select value={costType} onChange={(e) => setCostType(e.target.value)} className="flex-1">
              {COST_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Input type="number" value={costAmount} onChange={(e) => setCostAmount(e.target.value)} placeholder="Số tiền" className="w-32" />
            <Button variant="secondary" onClick={addCost} disabled={costSaving || !costAmount} className="gap-1 px-2 py-1 text-xs">
              <Plus size={14} />
            </Button>
          </div>
          {shipment.costs.length === 0 ? (
            <p className="text-sm text-text-secondary">Chưa có chi phí nào.</p>
          ) : (
            <ul className="text-sm text-text-secondary">
              {shipment.costs.map((c) => (
                <li key={c.id} className="flex justify-between border-b border-text-disabled/10 py-1 last:border-b-0">
                  <span>{COST_TYPE_OPTIONS.find((o) => o.value === c.type)?.label ?? c.type}</span>
                  <span className="tabular-nums">{c.amount.toLocaleString("vi-VN")} {c.currency}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {podOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay-scrim">
          <div className="glass-surface w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Ghi nhận bằng chứng giao hàng</h2>
            <div className="mb-3">
              <Label>Người nhận</Label>
              <Input value={receivedByName} onChange={(e) => setReceivedByName(e.target.value)} />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {podError && <p className="mt-3 text-sm text-semantic-danger">{podError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPodOpen(false)}>
                Hủy
              </Button>
              <Button onClick={submitPod} disabled={podSaving}>
                {podSaving ? "Đang lưu..." : "Xác nhận đã giao"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
