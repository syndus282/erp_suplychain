"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface UomRow {
  id: string;
  code: string;
  name: string;
}

export default function UomPage() {
  return (
    <CrudPage<UomRow>
      title="Đơn vị tính"
      description="Cái, Bộ, Thùng, Container, Kg... — quy đổi giữa các đơn vị làm ở Phase 2 khi cần."
      apiPath="/api/master-data/uom"
      searchPlaceholder="Tìm theo mã hoặc tên..."
      columns={[
        { key: "code", label: "Mã đơn vị" },
        { key: "name", label: "Tên đơn vị" },
      ]}
      fields={[
        { name: "code", label: "Mã đơn vị tính", type: "text", required: true },
        { name: "name", label: "Tên đơn vị tính", type: "text", required: true },
      ]}
    />
  );
}
