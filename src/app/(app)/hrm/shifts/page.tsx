"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface ShiftRow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export default function ShiftsPage() {
  return (
    <CrudPage<ShiftRow>
      title="Ca làm việc"
      apiPath="/api/hrm/shifts"
      columns={[
        { key: "name", label: "Tên ca" },
        { key: "startTime", label: "Giờ bắt đầu" },
        { key: "endTime", label: "Giờ kết thúc" },
      ]}
      fields={[
        { name: "name", label: "Tên ca", type: "text", required: true },
        { name: "startTime", label: "Giờ bắt đầu (HH:mm)", type: "text", required: true },
        { name: "endTime", label: "Giờ kết thúc (HH:mm)", type: "text", required: true },
      ]}
    />
  );
}
