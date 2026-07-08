"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface DriverRow {
  id: string;
  licenseNo: string | null;
  licenseType: string | null;
  licenseExpiry: string | null;
  employee: { fullName: string; code: string };
}

export default function DriversPage() {
  return (
    <CrudPage<DriverRow>
      title="Tài xế"
      description="Gán hồ sơ tài xế cho nhân viên đã có trong Tổ chức."
      apiPath="/api/logistics/drivers"
      hideSearch
      columns={[
        { key: "employee", label: "Nhân viên", render: (row) => `${row.employee.code} - ${row.employee.fullName}` },
        { key: "licenseNo", label: "Số GPLX" },
        { key: "licenseType", label: "Loại bằng" },
        { key: "licenseExpiry", label: "Hạn bằng", render: (row) => (row.licenseExpiry ? row.licenseExpiry.slice(0, 10) : "—") },
      ]}
      fields={[
        { name: "employeeId", label: "Nhân viên", type: "select", required: true, optionsUrl: "/api/org/employees?pageSize=200", optionLabelKey: "fullName" },
        { name: "licenseNo", label: "Số GPLX", type: "text" },
        { name: "licenseType", label: "Loại bằng", type: "text" },
        { name: "licenseExpiry", label: "Hạn bằng", type: "date" },
      ]}
    />
  );
}
