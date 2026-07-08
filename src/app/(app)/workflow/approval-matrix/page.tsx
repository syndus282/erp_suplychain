"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface ApprovalMatrixRow {
  id: string;
  transactionType: string;
  minAmount: number;
  maxAmount: number | null;
  approverRoleId: string;
  approverRole: { name: string };
}

export default function ApprovalMatrixPage() {
  return (
    <CrudPage<ApprovalMatrixRow>
      title="Approval Matrix"
      description="Cấu hình role duyệt theo loại giao dịch & mốc giá trị (VND). PurchaseOrder trình duyệt sẽ tra bảng này để tìm người duyệt."
      apiPath="/api/workflow/approval-matrix"
      hideSearch
      columns={[
        { key: "transactionType", label: "Loại giao dịch" },
        { key: "minAmount", label: "Từ (VND)", render: (r) => r.minAmount.toLocaleString("vi-VN") },
        {
          key: "maxAmount",
          label: "Đến (VND)",
          render: (r) => (r.maxAmount === null ? "Không giới hạn" : r.maxAmount.toLocaleString("vi-VN")),
        },
        { key: "approverRole", label: "Vai trò duyệt", render: (r) => r.approverRole.name },
      ]}
      fields={[
        {
          name: "transactionType",
          label: "Loại giao dịch",
          type: "select",
          required: true,
          options: [{ value: "PurchaseOrder", label: "Đơn mua hàng (PurchaseOrder)" }],
        },
        { name: "minAmount", label: "Từ (VND)", type: "number", required: true },
        { name: "maxAmount", label: "Đến (VND, bỏ trống = không giới hạn)", type: "number" },
        {
          name: "approverRoleId",
          label: "Vai trò duyệt",
          type: "select",
          required: true,
          optionsUrl: "/api/org/roles",
          optionLabelKey: "name",
        },
      ]}
    />
  );
}
