"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface CarrierRow {
  id: string;
  code: string;
  name: string;
  contractNo: string | null;
  serviceArea: string | null;
}

export default function CarriersPage() {
  return (
    <CrudPage<CarrierRow>
      title="Đơn vị vận chuyển ngoài"
      description="Nhà vận chuyển thuê ngoài — dùng khi chuyến hàng không dùng xe/tài xế nội bộ."
      apiPath="/api/logistics/carriers"
      columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên đơn vị" },
        { key: "contractNo", label: "Số hợp đồng" },
        { key: "serviceArea", label: "Khu vực phục vụ" },
      ]}
      fields={[
        { name: "code", label: "Mã", type: "text", required: true },
        { name: "name", label: "Tên đơn vị", type: "text", required: true },
        { name: "contractNo", label: "Số hợp đồng", type: "text" },
        { name: "serviceArea", label: "Khu vực phục vụ", type: "text" },
      ]}
    />
  );
}
