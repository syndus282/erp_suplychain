"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface AuditLogRow {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: { username: string } | null;
}

const ACTION_TONE: Record<string, "success" | "danger" | "info" | "warning" | "neutral"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
  APPROVE: "success",
  REJECT: "danger",
};

export function AuditLogClient() {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workflow/audit-logs?pageSize=50");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Audit Trail</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Nhật ký ai duyệt/từ chối gì, giá trị trước/sau — ghi tự động, không sửa/xóa được.
      </p>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có nhật ký nào" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Thời gian</Th>
                <Th>Hành động</Th>
                <Th>Đối tượng</Th>
                <Th>Người thực hiện</Th>
                <Th>Chi tiết</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>{new Date(row.createdAt).toLocaleString("vi-VN")}</Td>
                  <Td>
                    <Badge tone={ACTION_TONE[row.action] ?? "neutral"}>{row.action}</Badge>
                  </Td>
                  <Td>
                    {row.entityType} <span className="font-mono text-xs text-text-secondary">{row.entityId}</span>
                  </Td>
                  <Td>{row.changedBy?.username ?? "—"}</Td>
                  <Td className="max-w-sm truncate text-xs text-text-secondary">
                    <span title={row.newValue ?? ""}>{row.newValue ?? "—"}</span>
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
