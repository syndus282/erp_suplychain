"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  code?: string;
  name?: string;
}

interface ItemRow {
  id: string;
  unitPrice: number;
  currency: string;
  minQty: number;
  product: { code: string; name: string };
}

export function PriceListItemsClient({ priceListId }: { priceListId: string }) {
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [minQty, setMinQty] = useState("0");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/sales/price-list-items?priceListId=${priceListId}`);
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, [priceListId]);

  useEffect(() => {
    load();
    fetch("/api/master-data/products?pageSize=200")
      .then((r) => r.json())
      .then((body) => body.success && setProducts(body.data));
  }, [load]);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/sales/price-list-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceListId,
        productId,
        unitPrice: Number(unitPrice) || 0,
        minQty: Number(minQty) || 0,
      }),
    });
    const body = await res.json();
    if (!body.success) {
      setError(body.error?.message ?? "Có lỗi xảy ra");
      setSaving(false);
      return;
    }
    setProductId("");
    setUnitPrice("");
    setMinQty("0");
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/sales/price-list-items/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  return (
    <div>
      <Link href="/sales/price-lists" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Quay lại danh sách bảng giá
      </Link>

      <h1 className="mb-2 text-xl font-semibold text-text-primary">Chi tiết đơn giá theo sản phẩm</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Đơn giá này dùng để kiểm tra chính sách giá khi xác nhận đơn hàng — bán thấp hơn quá 20% so với giá ở đây sẽ yêu cầu phê duyệt.
      </p>

      <Card className="mb-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <Label>Sản phẩm</Label>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Đơn giá</Label>
            <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
          <div>
            <Label>SL tối thiểu</Label>
            <Input type="number" value={minQty} onChange={(e) => setMinQty(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={handleAdd} disabled={saving || !productId || !unitPrice} className="gap-1.5">
            <Plus size={16} /> Thêm đơn giá
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-semantic-danger">{error}</p>}
      </Card>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có đơn giá nào" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Sản phẩm</Th>
                <Th>Đơn giá</Th>
                <Th>SL tối thiểu</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>
                    {row.product.code} - {row.product.name}
                  </Td>
                  <Td className="tabular-nums">
                    {row.unitPrice.toLocaleString("vi-VN")} {row.currency}
                  </Td>
                  <Td>{row.minQty}</Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      aria-label="Xóa"
                      className="rounded p-1 text-semantic-danger hover:bg-semantic-danger/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
