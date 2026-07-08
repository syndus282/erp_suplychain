"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface CostCenterRow {
  id: string;
  code: string;
  name: string;
}

export default function CostCentersPage() {
  return (
    <CrudPage<CostCenterRow>
      title="Trung tâm chi phí"
      description="Dùng để phân bổ bút toán và ngân sách theo bộ phận/khu vực."
      apiPath="/api/finance/cost-centers"
      columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên trung tâm chi phí" },
      ]}
      fields={[
        { name: "code", label: "Mã", type: "text", required: true },
        { name: "name", label: "Tên trung tâm chi phí", type: "text", required: true },
      ]}
    />
  );
}
