"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";

interface AlertItem {
  type: "INVENTORY_REORDER" | "AR_OVERDUE" | "WARRANTY_DEFECT_RATE" | "CONTRACT_EXPIRING";
  severity: "warning" | "danger";
  title: string;
  detail: string;
}

const TYPE_LABEL: Record<AlertItem["type"], string> = {
  INVENTORY_REORDER: "Tồn kho",
  AR_OVERDUE: "Công nợ phải thu",
  WARRANTY_DEFECT_RATE: "Bảo hành",
  CONTRACT_EXPIRING: "Hợp đồng",
};

export function AlertsClient() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/bi/alerts");
    const body = await res.json();
    if (body.success) setAlerts(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Cảnh báo chủ động</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Hệ thống tự phát hiện vấn đề (tồn kho cần đặt hàng, công nợ quá hạn, tỷ lệ bảo hành bất
        thường) — tính động, không cần chờ báo cáo thủ công.
      </p>

      {loading ? (
        <EmptyState message="Đang tải..." />
      ) : alerts.length === 0 ? (
        <Card>
          <EmptyState message="Không có cảnh báo nào đang mở — mọi thứ trong ngưỡng bình thường." />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((a, i) => (
            <Card
              key={i}
              className={`flex items-start gap-3 ${
                a.severity === "danger" ? "border-semantic-danger/30" : "border-semantic-warning/30"
              }`}
            >
              {a.severity === "danger" ? (
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-semantic-danger" />
              ) : (
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-semantic-warning" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-surface-glass px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {TYPE_LABEL[a.type]}
                  </span>
                </div>
                <p className="mt-1 font-medium text-text-primary">{a.title}</p>
                <p className="text-sm text-text-secondary">{a.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
