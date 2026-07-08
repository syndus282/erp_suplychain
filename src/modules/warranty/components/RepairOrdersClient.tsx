"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRightCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

interface RepairOrderRow {
  id: string;
  status: string;
  laborCost: number;
  claim: { code: string; registration: { product: { code: string; name: string } } };
  technician: { fullName: string } | null;
}

const NEXT_LABEL: Record<string, string> = {
  RECEIVED: "Chẩn đoán",
  DIAGNOSING: "Bắt đầu sửa",
  REPAIRING: "Kiểm thử",
  TESTING: "Hoàn tất",
  COMPLETED: "Đã trả khách",
};

export function RepairOrdersClient() {
  const [rows, setRows] = useState<RepairOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/warranty/repair-orders");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(id: string) {
    setActingId(id);
    const res = await fetch(`/api/warranty/repair-orders/${id}/advance`, { method: "POST" });
    const body = await res.json();
    if (!body.success) alert(body.error?.message ?? "Không thể chuyển bước");
    setActingId(null);
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Lệnh sửa chữa</h1>
        <p className="mt-1 text-sm text-text-secondary">Tạo tự động khi chọn &quot;Sửa chữa&quot; ở Yêu cầu bảo hành — theo dõi từng bước đến khi trả khách.</p>
      </div>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Yêu cầu bảo hành</Th>
                <Th>Sản phẩm</Th>
                <Th>Kỹ thuật viên</Th>
                <Th>Chi phí sửa</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có lệnh sửa chữa nào" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.claim.code}</Td>
                    <Td>{row.claim.registration.product.code}</Td>
                    <Td>{row.technician?.fullName ?? "—"}</Td>
                    <Td className="tabular-nums">{row.laborCost.toLocaleString("vi-VN")} ₫</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>
                      {row.status !== "RETURNED" && (
                        <Button
                          variant="secondary"
                          disabled={actingId === row.id}
                          onClick={() => advance(row.id)}
                          className="gap-1 px-2 py-1 text-xs"
                        >
                          <ArrowRightCircle size={14} /> {NEXT_LABEL[row.status] ?? "Chuyển bước"}
                        </Button>
                      )}
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
