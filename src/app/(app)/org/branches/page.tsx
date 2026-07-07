"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface BranchRow {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
}

const TYPE_OPTIONS = [
  { value: "HEAD_OFFICE", label: "Trụ sở chính" },
  { value: "BRANCH", label: "Chi nhánh" },
  { value: "WAREHOUSE_SITE", label: "Điểm kho" },
];

export default function BranchesPage() {
  return (
    <CrudPage<BranchRow>
      title="Chi nhánh"
      description="Cơ cấu tổ chức: Company → Branch → Department → Employee."
      apiPath="/api/org/branches"
      searchPlaceholder="Tìm theo mã hoặc tên chi nhánh..."
      columns={[
        { key: "code", label: "Mã chi nhánh" },
        { key: "name", label: "Tên chi nhánh" },
        {
          key: "type",
          label: "Loại",
          render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type,
        },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      fields={[
        { name: "code", label: "Mã chi nhánh", type: "text", required: true },
        { name: "name", label: "Tên chi nhánh", type: "text", required: true },
        { name: "type", label: "Loại", type: "select", options: TYPE_OPTIONS },
        { name: "address", label: "Địa chỉ", type: "text" },
      ]}
    />
  );
}
