"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface CategoryRow {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
}

export default function CategoriesPage() {
  return (
    <CrudPage<CategoryRow>
      title="Nhóm hàng"
      description="Phân loại sản phẩm theo cây danh mục (Động cơ / Điện / Gầm...)."
      apiPath="/api/master-data/categories"
      searchPlaceholder="Tìm theo mã hoặc tên..."
      columns={[
        { key: "code", label: "Mã nhóm" },
        { key: "name", label: "Tên nhóm" },
      ]}
      fields={[
        { name: "code", label: "Mã nhóm hàng", type: "text", required: true },
        { name: "name", label: "Tên nhóm hàng", type: "text", required: true },
        {
          name: "parentId",
          label: "Nhóm cha",
          type: "select",
          optionsUrl: "/api/master-data/categories?pageSize=100",
          optionLabelKey: "name",
        },
      ]}
    />
  );
}
