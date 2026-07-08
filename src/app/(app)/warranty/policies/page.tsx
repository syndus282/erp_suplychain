"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface PolicyRow {
  id: string;
  durationMonths: number;
  conditions: string | null;
  product: { code: string; name: string } | null;
  category: { name: string } | null;
}

export default function WarrantyPoliciesPage() {
  return (
    <CrudPage<PolicyRow>
      title="Chính sách bảo hành"
      description="Thời hạn bảo hành theo sản phẩm hoặc theo nhóm hàng — bắt buộc phải có trước khi đăng ký bảo hành cho sản phẩm đó."
      apiPath="/api/warranty/policies"
      hideSearch
      columns={[
        { key: "product", label: "Sản phẩm", render: (row) => row.product?.code ?? "—" },
        { key: "category", label: "Nhóm hàng", render: (row) => row.category?.name ?? "—" },
        { key: "durationMonths", label: "Thời hạn (tháng)" },
        { key: "conditions", label: "Điều kiện" },
      ]}
      fields={[
        { name: "productId", label: "Sản phẩm (áp dụng riêng)", type: "select", optionsUrl: "/api/master-data/products?pageSize=200" },
        { name: "categoryId", label: "Nhóm hàng (áp dụng chung)", type: "select", optionsUrl: "/api/master-data/categories?pageSize=100" },
        { name: "durationMonths", label: "Thời hạn bảo hành (tháng)", type: "number", required: true },
        { name: "conditions", label: "Điều kiện bảo hành", type: "text" },
      ]}
    />
  );
}
