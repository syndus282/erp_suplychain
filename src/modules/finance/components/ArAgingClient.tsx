"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";

interface AgingInvoice {
  id: string;
  code: string;
  customer: { code: string; name: string };
  outstanding: number;
  dueDate: string | null;
}

interface Bucket {
  count: number;
  totalOutstanding: number;
  invoices: AgingInvoice[];
}

interface AgingReport {
  current: Bucket;
  days0to30: Bucket;
  days31to60: Bucket;
  days61to90: Bucket;
  over90: Bucket;
}

const BUCKET_LABELS: { key: keyof AgingReport; label: string; tone: string }[] = [
  { key: "current", label: "Chưa đến hạn", tone: "text-semantic-info" },
  { key: "days0to30", label: "Quá hạn 0-30 ngày", tone: "text-semantic-warning" },
  { key: "days31to60", label: "Quá hạn 31-60 ngày", tone: "text-semantic-warning" },
  { key: "days61to90", label: "Quá hạn 61-90 ngày", tone: "text-semantic-danger" },
  { key: "over90", label: "Quá hạn > 90 ngày", tone: "text-semantic-danger" },
];

export function ArAgingClient() {
  const [report, setReport] = useState<AgingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/ar-aging")
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setReport(body.data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Aging Report — Công nợ phải thu</h1>
        <p className="mt-1 text-sm text-text-secondary">Phân nhóm hóa đơn bán hàng còn nợ theo số ngày quá hạn tính từ hạn thanh toán.</p>
      </div>

      {loading || !report ? (
        <EmptyState message="Đang tải..." />
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {BUCKET_LABELS.map(({ key, label, tone }) => {
            const bucket = report[key];
            return (
              <Card key={key}>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className={`mt-1 text-lg font-semibold tabular-nums ${tone}`}>
                  {bucket.totalOutstanding.toLocaleString("vi-VN")} ₫
                </p>
                <p className="mt-1 text-xs text-text-secondary">{bucket.count} hóa đơn</p>
                {bucket.invoices.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 text-xs text-text-secondary">
                    {bucket.invoices.map((inv) => (
                      <li key={inv.id} className="flex justify-between">
                        <span>{inv.customer.name}</span>
                        <span className="tabular-nums">{inv.outstanding.toLocaleString("vi-VN")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
