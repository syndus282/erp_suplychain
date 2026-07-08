"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface VehicleRow {
  id: string;
  plateNumber: string;
  type: string | null;
  capacity: number | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "ON_DELIVERY", label: "Đang giao" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "INACTIVE", label: "Không sử dụng" },
];

export default function VehiclesPage() {
  return (
    <CrudPage<VehicleRow>
      title="Xe giao hàng"
      description="Quản lý phương tiện vận chuyển nội bộ."
      apiPath="/api/logistics/vehicles"
      columns={[
        { key: "plateNumber", label: "Biển số" },
        { key: "type", label: "Loại xe" },
        { key: "capacity", label: "Tải trọng" },
        {
          key: "status",
          label: "Trạng thái",
          render: (row) => STATUS_OPTIONS.find((o) => o.value === row.status)?.label ?? row.status,
        },
      ]}
      fields={[
        { name: "plateNumber", label: "Biển số", type: "text", required: true },
        { name: "type", label: "Loại xe", type: "text" },
        { name: "capacity", label: "Tải trọng (kg)", type: "number" },
        { name: "status", label: "Trạng thái", type: "select", options: STATUS_OPTIONS },
      ]}
    />
  );
}
