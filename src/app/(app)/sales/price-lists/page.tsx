"use client";

import Link from "next/link";
import { ListTree } from "lucide-react";
import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface PriceListRow {
  id: string;
  code: string;
  name: string;
  type: string;
  currency: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

const TYPE_OPTIONS = [
  { value: "PURCHASE", label: "Giá mua" },
  { value: "COST", label: "Giá vốn" },
  { value: "SALE", label: "Giá niêm yết (bán lẻ)" },
  { value: "DEALER", label: "Giá đại lý" },
  { value: "PROJECT", label: "Giá dự án" },
  { value: "PROMOTION", label: "Giá khuyến mãi" },
];

export default function PriceListsPage() {
  return (
    <CrudPage<PriceListRow>
      title="Bảng giá"
      description="Bảng giá theo loại khách hàng/kênh bán — gán cho khách hàng ở hồ sơ Khách hàng để áp giá và kiểm tra chiết khấu khi xác nhận đơn hàng."
      apiPath="/api/sales/price-lists"
      hideSearch
      columns={[
        { key: "code", label: "Mã bảng giá" },
        { key: "name", label: "Tên bảng giá" },
        { key: "type", label: "Loại", render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type },
        { key: "currency", label: "Tiền tệ" },
        {
          key: "items",
          label: "Chi tiết giá",
          render: (row) => (
            <Link href={`/sales/price-lists/${row.id}/items`} className="inline-flex items-center gap-1 text-brand-primary hover:underline">
              <ListTree size={14} /> Xem đơn giá
            </Link>
          ),
        },
      ]}
      fields={[
        { name: "code", label: "Mã bảng giá", type: "text", required: true },
        { name: "name", label: "Tên bảng giá", type: "text", required: true },
        { name: "type", label: "Loại bảng giá", type: "select", required: true, options: TYPE_OPTIONS },
        { name: "currency", label: "Tiền tệ", type: "text" },
        { name: "effectiveFrom", label: "Hiệu lực từ", type: "date" },
        { name: "effectiveTo", label: "Hiệu lực đến", type: "date" },
      ]}
    />
  );
}
