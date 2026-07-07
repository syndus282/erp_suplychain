"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";
import { StatusBadge } from "@/components/ui/Badge";

interface EmployeeRow {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  employeeType: string;
  status: string;
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  department: { name: string } | null;
  position: { name: string } | null;
  manager: { fullName: string } | null;
}

const EMPLOYEE_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "OUTSOURCE", label: "Thuê ngoài" },
];

export default function EmployeesPage() {
  return (
    <CrudPage<EmployeeRow>
      title="Nhân viên"
      description="Nhân viên được tham chiếu xuyên module: bán hàng, kho, kỹ thuật, phê duyệt."
      apiPath="/api/org/employees"
      searchPlaceholder="Tìm theo mã, tên hoặc email..."
      mapRowToForm={(row) => ({
        code: row.code,
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        departmentId: row.departmentId ?? "",
        positionId: row.positionId ?? "",
        managerId: row.managerId ?? "",
        employeeType: row.employeeType,
      })}
      columns={[
        { key: "code", label: "Mã NV" },
        { key: "fullName", label: "Họ tên" },
        { key: "department", label: "Phòng ban", render: (row) => row.department?.name ?? "—" },
        { key: "position", label: "Chức vụ", render: (row) => row.position?.name ?? "—" },
        { key: "manager", label: "Quản lý trực tiếp", render: (row) => row.manager?.fullName ?? "—" },
        { key: "status", label: "Trạng thái", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      fields={[
        { name: "code", label: "Mã nhân viên", type: "text", required: true },
        { name: "fullName", label: "Họ tên", type: "text", required: true },
        { name: "phone", label: "Điện thoại", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "departmentId", label: "Phòng ban", type: "select", optionsUrl: "/api/org/departments?pageSize=100" },
        { name: "positionId", label: "Chức vụ", type: "select", optionsUrl: "/api/org/positions?pageSize=100" },
        {
          name: "managerId",
          label: "Quản lý trực tiếp",
          type: "select",
          optionsUrl: "/api/org/employees?pageSize=100",
          optionLabelKey: "fullName",
        },
        { name: "employeeType", label: "Loại nhân viên", type: "select", options: EMPLOYEE_TYPE_OPTIONS },
      ]}
    />
  );
}
