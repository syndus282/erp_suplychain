"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface PositionRow {
  id: string;
  code: string;
  name: string;
}

export default function PositionsPage() {
  return (
    <CrudPage<PositionRow>
      title="Chức vụ"
      apiPath="/api/org/positions"
      searchPlaceholder="Tìm theo mã hoặc tên chức vụ..."
      columns={[
        { key: "code", label: "Mã chức vụ" },
        { key: "name", label: "Tên chức vụ" },
      ]}
      fields={[
        { name: "code", label: "Mã chức vụ", type: "text", required: true },
        { name: "name", label: "Tên chức vụ", type: "text", required: true },
      ]}
    />
  );
}
