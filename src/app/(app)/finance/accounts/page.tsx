"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface AccountRow {
  id: string;
  code: string;
  name: string;
  type: string;
  parent: { code: string; name: string } | null;
}

const TYPE_OPTIONS = [
  { value: "ASSET", label: "Tài sản" },
  { value: "LIABILITY", label: "Nợ phải trả" },
  { value: "EQUITY", label: "Vốn chủ sở hữu" },
  { value: "REVENUE", label: "Doanh thu" },
  { value: "EXPENSE", label: "Chi phí" },
];

export default function AccountsPage() {
  return (
    <CrudPage<AccountRow>
      title="Hệ thống tài khoản"
      description="Chart of Accounts — nền tảng cho mọi bút toán tự động (AP/AR) và thủ công (GL)."
      apiPath="/api/finance/accounts"
      columns={[
        { key: "code", label: "Mã tài khoản" },
        { key: "name", label: "Tên tài khoản" },
        { key: "type", label: "Loại", render: (row) => TYPE_OPTIONS.find((o) => o.value === row.type)?.label ?? row.type },
        { key: "parent", label: "Tài khoản cha", render: (row) => row.parent?.code ?? "—" },
      ]}
      fields={[
        { name: "code", label: "Mã tài khoản", type: "text", required: true },
        { name: "name", label: "Tên tài khoản", type: "text", required: true },
        { name: "type", label: "Loại tài khoản", type: "select", required: true, options: TYPE_OPTIONS },
        { name: "parentId", label: "Tài khoản cha", type: "select", optionsUrl: "/api/finance/accounts?pageSize=200" },
      ]}
    />
  );
}
