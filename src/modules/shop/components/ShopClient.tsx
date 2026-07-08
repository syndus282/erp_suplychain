"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Table";

interface ShopProduct {
  id: string;
  code: string;
  name: string;
  tradeName: string | null;
  brand: string | null;
  unitPrice: number | null;
  currency: string;
}

function formatPrice(n: number, currency: string): string {
  return currency === "VND" ? `${n.toLocaleString("vi-VN")} ₫` : `${n.toLocaleString("vi-VN")} ${currency}`;
}

export function ShopClient() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => res.json())
      .then((body) => {
        if (body.success) setProducts(body.data);
        setLoading(false);
      });
  }, []);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cartLines = Object.entries(cart).filter(([, qty]) => qty > 0);
  const cartTotal = cartLines.reduce((sum, [id, qty]) => sum + (productById.get(id)?.unitPrice ?? 0) * qty, 0);
  const cartCount = cartLines.reduce((sum, [, qty]) => sum + qty, 0);

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }
  function setQty(id: string, qty: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  }

  async function handleSubmitOrder() {
    setSubmitting(true);
    setFormError(null);
    const res = await fetch("/api/shop/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        phone,
        email,
        address,
        lines: cartLines.map(([productId, qty]) => ({ productId, qty })),
      }),
    });
    const body = await res.json();
    if (!body.success) {
      setFormError(body.error?.message ?? "Có lỗi xảy ra, vui lòng thử lại");
      setSubmitting(false);
      return;
    }
    setOrderCode(body.data.code);
    setSubmitting(false);
    setCart({});
  }

  if (orderCode) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-text-primary">Đặt hàng thành công!</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Mã đơn hàng của bạn là <span className="font-mono font-semibold text-text-primary">{orderCode}</span>.
            Nhân viên sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
          </p>
          <Button className="mt-4" onClick={() => setOrderCode(null)}>
            Tiếp tục mua sắm
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Cửa hàng phụ tùng ô tô</h1>
            <p className="mt-1 text-sm text-text-secondary">Đặt hàng online — nhân viên sẽ liên hệ xác nhận.</p>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="glass-surface flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-text-primary"
          >
            <ShoppingCart size={18} />
            Giỏ hàng ({cartCount})
          </button>
        </div>

        {loading ? (
          <EmptyState message="Đang tải sản phẩm..." />
        ) : products.length === 0 ? (
          <EmptyState message="Cửa hàng chưa có sản phẩm nào." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id} className="flex flex-col justify-between">
                <div>
                  <p className="text-xs text-text-secondary">{p.brand ?? p.code}</p>
                  <p className="mt-1 font-medium text-text-primary">{p.tradeName ?? p.name}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    {p.unitPrice !== null ? formatPrice(p.unitPrice, p.currency) : "Liên hệ báo giá"}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={p.unitPrice === null}
                    onClick={() => addToCart(p.id)}
                    className="px-3 py-1.5 text-xs"
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-md overflow-y-auto p-6">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Giỏ hàng của bạn</h2>

            {cartLines.length === 0 ? (
              <EmptyState message="Giỏ hàng đang trống" />
            ) : (
              <div className="flex flex-col gap-3">
                {cartLines.map(([id, qty]) => {
                  const p = productById.get(id);
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center justify-between rounded-lg border border-text-disabled/20 p-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{p.tradeName ?? p.name}</p>
                        <p className="text-xs text-text-secondary">{formatPrice(p.unitPrice ?? 0, p.currency)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setQty(id, qty - 1)} className="rounded p-1 hover:bg-surface-glass">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center tabular-nums">{qty}</span>
                        <button type="button" onClick={() => setQty(id, qty + 1)} className="rounded p-1 hover:bg-surface-glass">
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQty(id, 0)}
                          className="rounded p-1 text-semantic-danger hover:bg-semantic-danger/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-2 flex justify-between border-t border-text-disabled/20 pt-3 font-semibold text-text-primary">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(cartTotal, "VND")}</span>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <Label>Họ tên *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Số điện thoại *</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label>Địa chỉ giao hàng</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                {formError && <p className="mt-2 text-sm text-semantic-danger">{formError}</p>}

                <Button
                  className="mt-4 w-full"
                  disabled={submitting || !name || !phone}
                  onClick={handleSubmitOrder}
                >
                  {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
                </Button>
              </div>
            )}

            <Button variant="ghost" className="mt-3 w-full" onClick={() => setCheckoutOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
