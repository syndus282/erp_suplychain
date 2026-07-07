"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface PoLineOption {
  id: string;
  qty: number;
  qtyReceived: number;
  qtyRemaining: number;
  product: { id: string; code: string; name: string };
}

interface ReceiptLine {
  poLineId: string;
  productId: string;
  qtyOrdered: number;
  qtyReceived: number;
  product: { code: string; name: string };
}

interface ReceiptRow {
  id: string;
  code: string;
  status: string;
  receivedAt: string;
  warehouse: { name: string };
  po: { code: string };
  lines: ReceiptLine[];
}

const RECEIVABLE_STATUSES = ["APPROVED", "SENT_SUPPLIER", "CONFIRMED", "SHIPPING", "PARTIALLY_RECEIVED"];

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function GoodsReceiptsClient() {
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<Option[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [poId, setPoId] = useState("");
  const [poLines, setPoLines] = useState<PoLineOption[]>([]);
  const [qtyByLine, setQtyByLine] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/procurement/goods-receipts");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/master-data/warehouses?pageSize=100").then(setWarehouses);
    fetchOptions("/api/procurement/purchase-orders").then((all) =>
      setPurchaseOrders(all.filter((po) => RECEIVABLE_STATUSES.includes(String(po.status))))
    );
  }, [load]);

  function openCreate() {
    setWarehouseId("");
    setPoId("");
    setPoLines([]);
    setQtyByLine({});
    setFormError(null);
    setPanelOpen(true);
  }

  function handlePoChange(id: string) {
    setPoId(id);
    const po = purchaseOrders.find((p) => p.id === id) as { lines?: PoLineOption[] } | undefined;
    const lines = (po?.lines ?? []).filter((l) => l.qtyRemaining > 0);
    setPoLines(lines);
    const defaults: Record<string, string> = {};
    for (const l of lines) defaults[l.id] = String(l.qtyRemaining);
    setQtyByLine(defaults);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);

    const lines = poLines
      .filter((l) => Number(qtyByLine[l.id]) > 0)
      .map((l) => ({ poLineId: l.id, productId: l.product.id, qtyReceived: Number(qtyByLine[l.id]) }));

    const res = await fetch("/api/procurement/goods-receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId, poId, lines }),
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
          <h1 className="text-xl font-semibold text-text-primary">Phiếu nhập kho</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Nhận hàng theo đơn mua hàng — cập nhật số lượng đã nhận/còn lại của PO. Việc cập nhật tồn kho chi tiết
            (StockMovement/InventoryBalance) thuộc Phase 3.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5" disabled={purchaseOrders.length === 0}>
          <Plus size={16} /> Tạo phiếu nhập
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Số phiếu</Th>
                <Th>Đơn mua hàng</Th>
                <Th>Kho</Th>
                <Th>Số dòng</Th>
                <Th>Trạng thái</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có phiếu nhập kho nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.code}</Td>
                    <Td>{row.po?.code}</Td>
                    <Td>{row.warehouse?.name}</Td>
                    <Td>{row.lines.length}</Td>
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
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Tạo phiếu nhập kho</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Đơn mua hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={poId} onChange={(e) => handlePoChange(e.target.value)}>
                  <option value="">-- Chọn PO --</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {String(po.code)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Kho nhận <span className="text-semantic-danger">*</span>
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
            </div>

            {poLines.length > 0 && (
              <div className="mt-6">
                <Label>Số lượng nhận</Label>
                <div className="mt-2 flex flex-col gap-2">
                  {poLines.map((line) => (
                    <div key={line.id} className="flex items-center gap-3 rounded-lg border border-text-disabled/20 p-2">
                      <div className="flex-1 text-sm">
                        {line.product.code} - {line.product.name}
                        <div className="text-xs text-text-secondary">Còn lại: {line.qtyRemaining}</div>
                      </div>
                      <Input
                        type="number"
                        className="w-28"
                        value={qtyByLine[line.id] ?? ""}
                        onChange={(e) => setQtyByLine((prev) => ({ ...prev, [line.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formError && <p className="mt-4 text-sm text-semantic-danger">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !poId || !warehouseId}>
                {saving ? "Đang lưu..." : "Xác nhận nhận hàng"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
