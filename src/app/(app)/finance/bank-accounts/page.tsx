"use client";

import { CrudPage } from "@/modules/master-data/components/CrudPage";

interface BankAccountRow {
  id: string;
  bankName: string;
  accountNo: string;
  currency: string;
}

export default function BankAccountsPage() {
  return (
    <CrudPage<BankAccountRow>
      title="Tài khoản ngân hàng"
      apiPath="/api/finance/bank-accounts"
      columns={[
        { key: "bankName", label: "Ngân hàng" },
        { key: "accountNo", label: "Số tài khoản" },
        { key: "currency", label: "Tiền tệ" },
      ]}
      fields={[
        { name: "bankName", label: "Tên ngân hàng", type: "text", required: true },
        { name: "accountNo", label: "Số tài khoản", type: "text", required: true },
        { name: "currency", label: "Tiền tệ", type: "text" },
      ]}
    />
  );
}
