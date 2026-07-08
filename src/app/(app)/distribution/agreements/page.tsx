"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface AgreementRow {
  id: string;
  contractNo: string | null;
  reconciliationCycle: string;
  maxStockValue: number;
  dealer: { name: string };
}

const CYCLE_OPTIONS = [
  { value: "DAILY", label: "Hàng ngày" },
  { value: "WEEKLY", label: "Hàng tuần" },
  { value: "MONTHLY", label: "Hàng tháng" },
];

export default function ConsignmentAgreementsPage() {
  return (
    <CrudPage<AgreementRow>
      title="Hợp đồng ký gửi"
      description="Chính sách ký gửi theo từng đại lý — hạn mức tồn tối đa, chu kỳ đối soát."
      apiPath="/api/distribution/consignment-agreements"
      hideSearch
      columns={[
        { key: "dealer", label: "Đại lý", render: (row) => row.dealer.name },
        { key: "contractNo", label: "Số hợp đồng" },
        {
          key: "reconciliationCycle",
          label: "Chu kỳ đối soát",
          render: (row) => CYCLE_OPTIONS.find((o) => o.value === row.reconciliationCycle)?.label ?? row.reconciliationCycle,
        },
        { key: "maxStockValue", label: "Hạn mức tồn tối đa", render: (row) => `${row.maxStockValue.toLocaleString("vi-VN")} ₫` },
      ]}
      fields={[
        { name: "dealerId", label: "Đại lý", type: "select", required: true, optionsUrl: "/api/distribution/customers?type=DEALER" },
        { name: "contractNo", label: "Số hợp đồng", type: "text" },
        { name: "reconciliationCycle", label: "Chu kỳ đối soát", type: "select", options: CYCLE_OPTIONS },
        { name: "maxStockValue", label: "Hạn mức tồn tối đa (VND)", type: "number" },
      ]}
    />
  );
}
