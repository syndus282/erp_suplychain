"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface SalesReportRow {
  id: string;
  qtySold: number;
  endCustomerName: string | null;
  unitPrice: number;
  soldAt: string;
  dealer: { name: string };
  product: { code: string; name: string };
}

export default function ConsignmentSalesReportsPage() {
  return (
    <CrudPage<SalesReportRow>
      title="Đại lý báo bán hàng ký gửi"
      description="Ghi nhận đại lý đã bán hàng ký gửi cho khách hàng cuối — trừ vào tồn ký gửi của đại lý."
      apiPath="/api/distribution/consignment-sales-reports"
      hideSearch
      columns={[
        { key: "dealer", label: "Đại lý", render: (row) => row.dealer.name },
        { key: "product", label: "Sản phẩm", render: (row) => `${row.product.code} - ${row.product.name}` },
        { key: "qtySold", label: "SL bán" },
        { key: "endCustomerName", label: "Khách hàng cuối" },
        { key: "unitPrice", label: "Đơn giá", render: (row) => `${row.unitPrice.toLocaleString("vi-VN")} ₫` },
      ]}
      fields={[
        { name: "dealerId", label: "Đại lý", type: "select", required: true, optionsUrl: "/api/distribution/customers?type=DEALER" },
        { name: "productId", label: "Sản phẩm", type: "select", required: true, optionsUrl: "/api/master-data/products?pageSize=100" },
        { name: "qtySold", label: "Số lượng bán", type: "number", required: true },
        { name: "unitPrice", label: "Đơn giá bán (VND)", type: "number", required: true },
        { name: "endCustomerName", label: "Tên khách hàng cuối", type: "text" },
      ]}
    />
  );
}
