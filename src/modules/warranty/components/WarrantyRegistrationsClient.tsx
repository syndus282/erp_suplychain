"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface RegistrationRow {
  id: string;
  soldAt: string | null;
  warrantyStart: string;
  warrantyEnd: string;
  product: { code: string; name: string };
  customer: { name: string };
  serial: { serialNo: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

export function WarrantyRegistrationsClient() {
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [products, setProducts] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [salesOrders, setSalesOrders] = useState<Option[]>([]);

  const [productId, setProductId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [soId, setSoId] = useState("");
  const [soldAt, setSoldAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/registrations");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/master-data/products?pageSize=200").then(setProducts);
    fetchOptions("/api/distribution/customers?pageSize=200").then(setCustomers);
    fetchOptions("/api/sales/orders?pageSize=200").then(setSalesOrders);
  }, [load]);

  function openCreate() {
    setProductId("");
    setCustomerId("");
    setSoId("");
    setSoldAt("");
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    const res = await fetch("/api/warranty/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, customerId, soId: soId || undefined, soldAt: soldAt || undefined }),
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
          <h1 className="text-xl font-semibold text-text-primary">Đăng ký bảo hành</h1>
          <p className="mt-1 text-sm text-text-secondary">Kích hoạt bảo hành cho sản phẩm đã bán — thời hạn tự tính theo Chính sách bảo hành.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Đăng ký bảo hành
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Sản phẩm</Th>
                <Th>Serial</Th>
                <Th>Khách hàng</Th>
                <Th>Ngày bán</Th>
                <Th>Hết hạn bảo hành</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Chưa có đăng ký bảo hành nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>
                      {row.product.code} - {row.product.name}
                    </Td>
                    <Td>{row.serial?.serialNo ?? "—"}</Td>
                    <Td>{row.customer.name}</Td>
                    <Td>{row.soldAt ? row.soldAt.slice(0, 10) : "—"}</Td>
                    <Td>{row.warrantyEnd.slice(0, 10)}</Td>
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
              <h2 className="text-lg font-semibold text-text-primary">Đăng ký bảo hành</h2>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded p-1 text-text-secondary hover:bg-surface-glass">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <Label>
                  Sản phẩm <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {String(p.code)} - {String(p.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Khách hàng <span className="text-semantic-danger">*</span>
                </Label>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {String(c.name)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Đơn hàng bán liên quan</Label>
                <Select value={soId} onChange={(e) => setSoId(e.target.value)}>
                  <option value="">-- Không liên kết --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id}>
                      {String(so.code)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Ngày bán</Label>
                <Input type="date" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} />
              </div>
            </div>

            {formError && <p className="mt-3 text-sm text-semantic-danger">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !productId || !customerId}>
                {saving ? "Đang lưu..." : "Đăng ký"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
