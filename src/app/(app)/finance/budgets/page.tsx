"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface BudgetRow {
  id: string;
  period: string;
  category: string;
  plannedAmount: number;
  currency: string;
  department: { name: string } | null;
  costCenter: { name: string } | null;
}

export default function BudgetsPage() {
  return (
    <CrudPage<BudgetRow>
      title="Ngân sách"
      description="Đăng ký dự toán theo kỳ/hạng mục — báo cáo thực chi so ngân sách để lại phase sau (cần rollup từ GL)."
      apiPath="/api/finance/budgets"
      hideSearch
      columns={[
        { key: "period", label: "Kỳ ngân sách" },
        { key: "category", label: "Hạng mục" },
        { key: "department", label: "Phòng ban", render: (row) => row.department?.name ?? "—" },
        { key: "costCenter", label: "Trung tâm chi phí", render: (row) => row.costCenter?.name ?? "—" },
        { key: "plannedAmount", label: "Số tiền dự toán", render: (row) => `${row.plannedAmount.toLocaleString("vi-VN")} ${row.currency}` },
      ]}
      fields={[
        { name: "period", label: "Kỳ ngân sách (vd. 2026-Q1)", type: "text", required: true },
        { name: "category", label: "Hạng mục", type: "text", required: true },
        { name: "departmentId", label: "Phòng ban", type: "select", optionsUrl: "/api/org/departments?pageSize=100" },
        { name: "costCenterId", label: "Trung tâm chi phí", type: "select", optionsUrl: "/api/finance/cost-centers?pageSize=100" },
        { name: "plannedAmount", label: "Số tiền dự toán (VND)", type: "number", required: true },
      ]}
    />
  );
}
