"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

interface DetailLine {
  invoiceCode: string;
  outstandingForeign: number;
  oldVnd: number;
  newVnd: number;
  diff: number;
}

interface Result {
  currency: string;
  newExchangeRate: number;
  totalDiff: number;
  detail: DetailLine[];
}

export function FxRevaluationClient() {
  const [currency, setCurrency] = useState("USD");
  const [newExchangeRate, setNewExchangeRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/finance/fx-revaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency, newExchangeRate: Number(newExchangeRate) || 0 }),
    });
    const body = await res.json();
    if (!body.success) {
      setError(body.error?.message ?? "Không thể đánh giá lại");
      setLoading(false);
      return;
    }
    setResult(body.data);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Đánh giá lại số dư ngoại tệ cuối kỳ</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Đánh giá lại công nợ phải trả (AP) còn nợ bằng ngoại tệ theo tỷ giá mới — tự động ghi 1 bút toán chênh lệch tổng hợp (515/635), không đổi tỷ giá gốc của từng hóa đơn.
        </p>
      </div>

      <Card className="mb-6 max-w-md">
        <div className="flex flex-col gap-3">
          <div>
            <Label>Loại ngoại tệ</Label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
          </div>
          <div>
            <Label>Tỷ giá mới (1 ngoại tệ = ? VND)</Label>
            <Input type="number" value={newExchangeRate} onChange={(e) => setNewExchangeRate(e.target.value)} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-semantic-danger">{error}</p>}
        <div className="mt-4">
          <Button onClick={handleSubmit} disabled={loading || !currency || !newExchangeRate}>
            {loading ? "Đang xử lý..." : "Đánh giá lại"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <p className="mb-3 text-sm font-semibold text-text-primary">
            Kết quả: chênh lệch tổng {result.totalDiff > 0 ? "lỗ" : result.totalDiff < 0 ? "lãi" : "không đổi"}{" "}
            <span className={result.totalDiff > 0 ? "text-semantic-danger" : "text-semantic-success"}>
              {Math.abs(result.totalDiff).toLocaleString("vi-VN")} ₫
            </span>
          </p>
          <ul className="flex flex-col gap-1 text-sm text-text-secondary">
            {result.detail.map((d) => (
              <li key={d.invoiceCode} className="flex justify-between border-b border-text-disabled/10 py-1 last:border-b-0">
                <span>{d.invoiceCode}</span>
                <span className="tabular-nums">
                  {d.oldVnd.toLocaleString("vi-VN")} → {d.newVnd.toLocaleString("vi-VN")} ₫ ({d.diff > 0 ? "+" : ""}
                  {d.diff.toLocaleString("vi-VN")})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
