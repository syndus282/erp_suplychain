"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface SupplierRow {
  id: string;
  code: string;
  name: string;
  type: string;
  country: string | null;
  currency: string;
  status: string;
}

const TYPE_OPTIONS = [
  { value: "FOREIGN_MANUFACTURER", label: "Nhà sản xuất nước ngoài" },
  { value: "SUPPLIER", label: "Nhà cung cấp" },
  { value: "ENTRUSTED_IMPORT_UNIT", label: "Đơn vị nhập khẩu ủy thác" },
  { value: "CARRIER", label: "Nhà vận chuyển" },
  { value: "SERVICE_PROVIDER", label: "Nhà cung cấp dịch vụ" },
];

export default function SuppliersPage() {
  return (
    <CrudPage<SupplierRow>
      title="Nhà cung cấp"
      description="Bao gồm nhà sản xuất nước ngoài, nhà cung cấp, và đơn vị nhập khẩu ủy thác."
      apiPath="/api/procurement/suppliers"
      searchPlaceholder="Tìm theo mã, tên hoặc mã số thuế..."
      columns={[
        { key: "code", label: "Mã NCC" },
        { key: "name", label: "Tên" },
        { key: "type", label: "Loại", render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type },
        { key: "country", label: "Quốc gia" },
        { key: "currency", label: "Tiền tệ" },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      fields={[
        { name: "code", label: "Mã nhà cung cấp", type: "text", required: true },
        { name: "name", label: "Tên nhà cung cấp", type: "text", required: true },
        { name: "type", label: "Loại", type: "select", required: true, options: TYPE_OPTIONS },
        { name: "country", label: "Quốc gia", type: "text" },
        { name: "taxCode", label: "Mã số thuế", type: "text" },
        { name: "contactName", label: "Người liên hệ", type: "text" },
        { name: "phone", label: "Điện thoại", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "paymentTerm", label: "Điều khoản thanh toán", type: "text" },
        { name: "currency", label: "Tiền tệ giao dịch", type: "text" },
      ]}
    />
  );
}
