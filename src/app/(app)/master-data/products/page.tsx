"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface ProductRow {
  id: string;
  code: string;
  name: string;
  tradeName: string | null;
  partNumber: string | null;
  oemCode: string | null;
  brand: string | null;
  originCountry: string | null;
  status: string;
  manageSerial: boolean;
  manageLot: boolean;
  safetyStock: number;
  reorderPoint: number;
  moq: number;
  leadTimeDays: number;
  category: { id: string; name: string } | null;
  baseUom: { id: string; name: string } | null;
  vehicleCompatibilities: { vehicleModel: { id: string; model: string } }[];
}

export default function ProductsPage() {
  return (
    <CrudPage<ProductRow>
      title="Sản phẩm"
      description="Danh mục phụ tùng — master data quan trọng nhất (docs/business-spec/13 mục 4-8)."
      apiPath="/api/master-data/products"
      searchPlaceholder="Tìm theo mã, tên hoặc part number..."
      mapRowToForm={(row) => ({
        code: row.code,
        name: row.name,
        tradeName: row.tradeName,
        partNumber: row.partNumber,
        oemCode: row.oemCode,
        brand: row.brand,
        originCountry: row.originCountry,
        categoryId: row.category?.id ?? "",
        baseUomId: row.baseUom?.id ?? "",
        vehicleModelIds: row.vehicleCompatibilities.map((vc) => vc.vehicleModel.id),
        manageSerial: row.manageSerial,
        manageLot: row.manageLot,
        safetyStock: row.safetyStock,
        reorderPoint: row.reorderPoint,
        moq: row.moq,
        leadTimeDays: row.leadTimeDays,
      })}
      columns={[
        { key: "code", label: "Mã hàng" },
        { key: "name", label: "Tên hàng" },
        { key: "partNumber", label: "Part Number" },
        { key: "category", label: "Nhóm hàng", render: (row) => row.category?.name ?? "—" },
        { key: "baseUom", label: "ĐVT", render: (row) => row.baseUom?.name ?? "—" },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      fields={[
        { name: "code", label: "Mã hàng (SKU)", type: "text", required: true },
        { name: "name", label: "Tên hàng", type: "text", required: true },
        { name: "tradeName", label: "Tên thương mại", type: "text" },
        { name: "partNumber", label: "Part Number", type: "text" },
        { name: "oemCode", label: "OEM Code", type: "text" },
        { name: "brand", label: "Hãng sản xuất", type: "text" },
        { name: "originCountry", label: "Xuất xứ", type: "text" },
        {
          name: "categoryId",
          label: "Nhóm hàng",
          type: "select",
          optionsUrl: "/api/master-data/categories?pageSize=100",
        },
        {
          name: "baseUomId",
          label: "Đơn vị tính cơ bản",
          type: "select",
          optionsUrl: "/api/master-data/uom?pageSize=100",
        },
        {
          name: "vehicleModelIds",
          label: "Xe tương thích (giữ Ctrl/Cmd để chọn nhiều)",
          type: "select",
          multiple: true,
          optionsUrl: "/api/master-data/vehicle-models?pageSize=100",
          optionLabelKey: "model",
        },
        { name: "manageSerial", label: "Quản lý theo Serial", type: "checkbox" },
        { name: "manageLot", label: "Quản lý theo Lot/Batch", type: "checkbox" },
        { name: "safetyStock", label: "Tồn an toàn (Safety Stock)", type: "number" },
        { name: "reorderPoint", label: "Điểm đặt hàng lại (Reorder Point)", type: "number" },
        { name: "moq", label: "Số lượng đặt tối thiểu (MOQ)", type: "number" },
        { name: "leadTimeDays", label: "Lead time (ngày)", type: "number" },
      ]}
    />
  );
}
