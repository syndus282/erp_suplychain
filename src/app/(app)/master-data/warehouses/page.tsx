"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface WarehouseRow {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
}

const WAREHOUSE_TYPE_OPTIONS = [
  { value: "CENTRAL", label: "Kho trung tâm" },
  { value: "BRANCH", label: "Kho chi nhánh" },
  { value: "CONSIGNMENT", label: "Kho ký gửi" },
  { value: "WARRANTY", label: "Kho bảo hành" },
  { value: "DEFECTIVE", label: "Kho hàng lỗi" },
  { value: "QC", label: "Kho QC" },
  { value: "IN_TRANSIT", label: "Kho đang vận chuyển" },
  { value: "TECHNICIAN", label: "Kho kỹ thuật viên" },
  { value: "DEMO", label: "Kho demo" },
];

export default function WarehousesPage() {
  return (
    <CrudPage<WarehouseRow>
      title="Kho"
      description="Kho trung tâm, chi nhánh, ký gửi, bảo hành... — quản lý vị trí lưu trữ trong từng kho ở trang Kho & vị trí sau khi tạo."
      apiPath="/api/master-data/warehouses"
      searchPlaceholder="Tìm theo mã hoặc tên kho..."
      columns={[
        { key: "code", label: "Mã kho" },
        { key: "name", label: "Tên kho" },
        {
          key: "type",
          label: "Loại kho",
          render: (row) => WAREHOUSE_TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type,
        },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
        {
          key: "locations",
          label: "Vị trí",
          render: (row) => (
            <Link href={`/master-data/warehouses/${row.id}/locations`} className="inline-flex items-center gap-1 text-brand-primary hover:underline">
              <MapPin size={14} /> Xem vị trí
            </Link>
          ),
        },
      ]}
      fields={[
        { name: "code", label: "Mã kho", type: "text", required: true },
        { name: "name", label: "Tên kho", type: "text", required: true },
        { name: "type", label: "Loại kho", type: "select", required: true, options: WAREHOUSE_TYPE_OPTIONS },
        { name: "address", label: "Địa chỉ", type: "text" },
      ]}
    />
  );
}
