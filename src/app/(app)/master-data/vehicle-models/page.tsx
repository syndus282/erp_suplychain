"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface VehicleModelRow {
  id: string;
  make: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  engine: string | null;
}

export default function VehicleModelsPage() {
  return (
    <CrudPage<VehicleModelRow>
      title="Xe tương thích"
      description="Danh mục hãng xe/model dùng để gán tương thích phụ tùng."
      apiPath="/api/master-data/vehicle-models"
      searchPlaceholder="Tìm theo hãng hoặc model..."
      columns={[
        { key: "make", label: "Hãng xe" },
        { key: "model", label: "Model" },
        { key: "yearFrom", label: "Từ năm" },
        { key: "yearTo", label: "Đến năm" },
        { key: "engine", label: "Động cơ" },
      ]}
      fields={[
        { name: "make", label: "Hãng xe", type: "text", required: true },
        { name: "model", label: "Model", type: "text", required: true },
        { name: "yearFrom", label: "Từ năm sản xuất", type: "number" },
        { name: "yearTo", label: "Đến năm sản xuất", type: "number" },
        { name: "engine", label: "Động cơ", type: "text" },
        { name: "fuelType", label: "Loại nhiên liệu", type: "text" },
      ]}
    />
  );
}
