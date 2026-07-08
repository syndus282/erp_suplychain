"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface ContractRow {
  id: string;
  code: string;
  type: string;
  title: string;
  partnerType: string | null;
  partnerId: string | null;
  startDate: string;
  endDate: string | null;
  value: number | null;
  currency: string;
  status: string;
  fileUrl: string | null;
  note: string | null;
}

const TYPE_OPTIONS = [
  { value: "SUPPLIER", label: "Hợp đồng nhà cung cấp" },
  { value: "CUSTOMER", label: "Hợp đồng khách hàng" },
  { value: "SERVICE", label: "Hợp đồng dịch vụ" },
  { value: "OTHER", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "ACTIVE", label: "Đang hiệu lực" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "TERMINATED", label: "Đã chấm dứt" },
];

export default function ContractsPage() {
  return (
    <CrudPage<ContractRow>
      title="Hợp đồng"
      description="Quản lý hợp đồng tổng quát (NCC/khách hàng/dịch vụ) — hợp đồng ký gửi đại lý và hợp đồng lao động quản lý ở màn hình riêng. Hợp đồng sắp hết hạn được cảnh báo tự động ở trang Cảnh báo."
      apiPath="/api/contracts"
      searchPlaceholder="Tìm theo mã hoặc tên hợp đồng..."
      columns={[
        { key: "code", label: "Mã hợp đồng" },
        { key: "title", label: "Tên hợp đồng" },
        { key: "type", label: "Loại", render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type },
        { key: "startDate", label: "Bắt đầu", render: (row) => new Date(row.startDate).toLocaleDateString("vi-VN") },
        {
          key: "endDate",
          label: "Kết thúc",
          render: (row) => (row.endDate ? new Date(row.endDate).toLocaleDateString("vi-VN") : "—"),
        },
        {
          key: "value",
          label: "Giá trị",
          render: (row) => (row.value ? `${row.value.toLocaleString("vi-VN")} ${row.currency}` : "—"),
        },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      fields={[
        { name: "code", label: "Mã hợp đồng", type: "text", required: true },
        { name: "title", label: "Tên hợp đồng", type: "text", required: true },
        { name: "type", label: "Loại hợp đồng", type: "select", required: true, options: TYPE_OPTIONS },
        { name: "status", label: "Trạng thái", type: "select", options: STATUS_OPTIONS },
        { name: "startDate", label: "Ngày bắt đầu", type: "date", required: true },
        { name: "endDate", label: "Ngày kết thúc", type: "date" },
        { name: "value", label: "Giá trị hợp đồng", type: "number" },
        { name: "currency", label: "Tiền tệ", type: "text" },
        { name: "fileUrl", label: "Link tài liệu đính kèm", type: "text" },
        { name: "note", label: "Ghi chú", type: "textarea" },
      ]}
    />
  );
}
