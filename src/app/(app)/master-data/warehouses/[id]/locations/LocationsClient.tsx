"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface LocationRow {
  id: string;
  code: string;
  type: string;
  parentId: string | null;
  capacity: number | null;
}

const TYPE_OPTIONS = [
  { value: "ZONE", label: "Khu vực (Zone)" },
  { value: "RACK", label: "Kệ (Rack)" },
  { value: "LEVEL", label: "Tầng (Level)" },
  { value: "BIN", label: "Ô chứa (Bin)" },
];

export function LocationsClient({ warehouseId }: { warehouseId: string }) {
  return (
    <div>
      <Link href="/master-data/warehouses" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={14} /> Quay lại danh sách kho
      </Link>
      <CrudPage<LocationRow>
        title="Vị trí trong kho"
        description="Cây vị trí Zone → Rack → Level → Bin của kho này."
        apiPath="/api/master-data/storage-locations"
        hideSearch
        extraQueryParams={{ warehouseId }}
        fixedCreateValues={{ warehouseId }}
        columns={[
          { key: "code", label: "Mã vị trí" },
          {
            key: "type",
            label: "Loại",
            render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type,
          },
          { key: "capacity", label: "Sức chứa" },
        ]}
        fields={[
          { name: "code", label: "Mã vị trí", type: "text", required: true },
          { name: "type", label: "Loại vị trí", type: "select", required: true, options: TYPE_OPTIONS },
          {
            name: "parentId",
            label: "Vị trí cha",
            type: "select",
            optionsUrl: `/api/master-data/storage-locations?warehouseId=${warehouseId}`,
            optionLabelKey: "code",
          },
          { name: "capacity", label: "Sức chứa", type: "number" },
        ]}
      />
    </div>
  );
}
