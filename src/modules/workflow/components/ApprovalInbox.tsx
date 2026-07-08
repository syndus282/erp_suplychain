"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface ApprovalStep {
  id: string;
  stepOrder: number;
  status: string;
}

interface ApprovalRequestRow {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  createdAt: string;
  steps: ApprovalStep[];
}

export function ApprovalInbox() {
  const [rows, setRows] = useState<ApprovalRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workflow/approval-requests?assignedToMe=true");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, decision: "APPROVED" | "REJECTED") {
    setActingId(id);
    await fetch(`/api/workflow/approval-requests/${id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setActingId(null);
    load();
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Hộp thư duyệt</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Các yêu cầu duyệt đang chờ bạn xử lý — theo đích danh hoặc theo vai trò (Approval Matrix,
        xem trang &quot;Approval Matrix&quot; để cấu hình theo giá trị giao dịch).
      </p>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Loại</Th>
                <Th>Đối tượng</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày tạo</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message="Không có yêu cầu nào đang chờ bạn duyệt" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.entityType}</Td>
                    <Td className="font-mono text-xs">{row.entityId}</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>{new Date(row.createdAt).toLocaleString("vi-VN")}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          disabled={actingId === row.id}
                          onClick={() => decide(row.id, "APPROVED")}
                          className="gap-1 px-2 py-1"
                        >
                          <Check size={14} /> Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          disabled={actingId === row.id}
                          onClick={() => decide(row.id, "REJECTED")}
                          className="gap-1 px-2 py-1"
                        >
                          <X size={14} /> Từ chối
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
