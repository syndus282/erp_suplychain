"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface DepartmentRow {
  id: string;
  code: string;
  name: string;
  branchId: string | null;
  branch: { name: string } | null;
}

export default function DepartmentsPage() {
  return (
    <CrudPage<DepartmentRow>
      title="Phòng ban"
      description="Phòng ban thuộc chi nhánh, có thể lồng cây qua phòng ban cha."
      apiPath="/api/org/departments"
      searchPlaceholder="Tìm theo mã hoặc tên phòng ban..."
      mapRowToForm={(row) => ({ code: row.code, name: row.name, branchId: row.branchId ?? "" })}
      columns={[
        { key: "code", label: "Mã phòng ban" },
        { key: "name", label: "Tên phòng ban" },
        { key: "branch", label: "Chi nhánh", render: (row) => row.branch?.name ?? "—" },
      ]}
      fields={[
        { name: "code", label: "Mã phòng ban", type: "text", required: true },
        { name: "name", label: "Tên phòng ban", type: "text", required: true },
        { name: "branchId", label: "Chi nhánh", type: "select", optionsUrl: "/api/org/branches?pageSize=100" },
      ]}
    />
  );
}
