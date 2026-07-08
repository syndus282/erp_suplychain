// Seed dữ liệu khởi tạo tối thiểu cho môi trường dev:
// - 1 Company mặc định (docs/ROADMAP.md Phase 0)
// - Permission catalog cơ bản cho các resource của Phase 1 + Role "ADMIN" có
//   toàn bộ quyền + 1 User đăng nhập được để test (KHÔNG dùng mật khẩu này ở
//   production — đổi ngay sau khi có user thật).
//
// Chạy: npm run prisma:seed (hoặc `prisma db seed`).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const RESOURCES = [
  // Phase 1 — Foundation
  "product",
  "product-category",
  "uom",
  "vehicle-model",
  "warehouse",
  "storage-location",
  "branch",
  "department",
  "position",
  "employee",
  "approval-request",
  // Phase 2 — Procurement & Entrusted Import
  "supplier",
  "purchase-request",
  "purchase-order",
  "import-shipment",
  "landed-cost",
  "goods-receipt",
  "user", // chỉ read — dùng để chọn người duyệt (approver) trong workflow
  // Phase 3 — Inventory & Warehouse
  "inventory-balance", // chỉ read — số liệu tổng hợp, không sửa tay
  "stock-movement", // chỉ read — sổ cái, không sửa/xóa
  "stock-transfer",
  "stock-count",
  "serial-number", // chỉ read — tạo qua GoodsReceipt, chưa có CRUD riêng ở Phase 3
  // Phase 4 — Distribution & Consignment
  "customer", // bao gồm cả Dealer (Customer.type = DEALER + DealerProfile)
  "consignment-agreement",
  "consignment-shipment",
  "consignment-balance", // chỉ read — số liệu tổng hợp
  "consignment-sales-report",
  "consignment-reconciliation",
  "stock-recall",
  // Phase 5 — Sales Order & Customer
  "price-list", // bao gồm cả PriceListItem (không có permission resource riêng)
  "quotation",
  "sales-order",
  "sales-return",
  // Phase 6 — Logistics & Delivery
  "vehicle",
  "driver",
  "carrier",
  "delivery-request",
  "shipment",
  "delivery-cost",
  // Phase 7 — Warranty, RMA & Field Service
  "warranty-policy",
  "warranty-registration",
  "warranty-claim",
  "rma-request",
  "core-return",
  "repair-order",
  "field-service-request",
  // Phase 8 — Finance & Accounting
  "account",
  "cost-center",
  "journal-entry",
  "supplier-invoice",
  "customer-invoice",
  "payment",
  "bank-account",
  "fixed-asset",
  "budget",
  "fx-revaluation",
  // Phase 9 — HRM, Attendance & Payroll
  "employment-contract",
  "shift",
  "attendance",
  "leave-request",
  "commission-record",
  "payroll",
  // Phase 10 — Workflow/Approval hoàn chỉnh
  "approval-matrix",
  "audit-log",
  "notification",
  "role", // chỉ read — dùng để chọn approverRoleId khi cấu hình Approval Matrix
  // Phase 11 — Business Intelligence & Dashboard
  "bi-dashboard", // chỉ read — toàn bộ báo cáo tổng hợp/cảnh báo đều tính động, không có form tạo/sửa
  // Phase 12 — Contract Management & Online Channel
  "contract",
] as const;

const ACTIONS = ["read", "create", "update"] as const;

/** Action đặc thù ngoài read/create/update, chỉ áp dụng cho 1 số resource. */
const EXTRA_ACTIONS: Partial<Record<(typeof RESOURCES)[number], string[]>> = {
  "purchase-order": ["submit"],
  "stock-transfer": ["ship", "receive"],
  "stock-count": ["submit", "approve"],
  "consignment-shipment": ["deliver"],
  "stock-recall": ["receive"],
  quotation: ["send", "accept", "reject", "convert"],
  "sales-order": ["confirm", "allocate", "cancel"],
  "sales-return": ["approve", "reject", "receive", "qc", "refund"],
  shipment: ["dispatch", "pod", "close"],
  "warranty-claim": ["inspect", "approve", "reject", "repair", "replace", "close"],
  "rma-request": ["approve", "reject", "receive", "qc", "repair", "replace"],
  "core-return": ["receive", "overdue", "lost"],
  "repair-order": ["advance"],
  "field-service-request": ["assign", "start", "complete", "cancel"],
  "journal-entry": ["post", "lock"],
  "fixed-asset": ["depreciate"],
  "fx-revaluation": ["revalue"],
  attendance: ["check-in", "check-out"],
  "leave-request": ["approve", "reject"],
  payroll: ["generate", "confirm", "pay"],
};

/** Resource chỉ có 1 phần action chuẩn (vd. "user" chỉ có read, chưa có UI tạo/sửa User ở Phase 1-2). */
const ACTIONS_OVERRIDE: Partial<Record<(typeof RESOURCES)[number], readonly string[]>> = {
  user: ["read"],
  "inventory-balance": ["read"],
  "stock-movement": ["read"],
  "serial-number": ["read"],
  "consignment-balance": ["read"],
  "delivery-request": ["read", "create"], // tạo qua action từ Sales Order, không có form sửa tay
  "delivery-cost": ["read", "create"],
  "warranty-registration": ["read", "create"],
  "warranty-claim": ["read", "create"],
  "rma-request": ["read", "create"],
  "core-return": ["read", "create"],
  "repair-order": ["read"], // tạo qua action WarrantyClaim.repair, không có form tạo tay
  "field-service-request": ["read", "create"],
  "supplier-invoice": ["read", "create"],
  "customer-invoice": ["read", "create"],
  payment: ["read", "create"],
  "journal-entry": ["read", "create"],
  "fx-revaluation": [], // chỉ có action "revalue", không có CRUD chuẩn
  "employment-contract": ["read", "create"],
  attendance: ["read"], // chỉ có action check-in/check-out, không có form tạo tay
  "leave-request": ["read", "create"],
  "commission-record": ["read", "create"],
  payroll: ["read"], // chỉ có action generate/confirm/pay, không có form tạo tay
  "audit-log": ["read"], // chỉ đọc, ghi tự động từ decideApprovalStep
  notification: ["read"], // mark-as-read dùng chung quyền read (thao tác trên inbox của chính mình)
  role: ["read"],
  "bi-dashboard": ["read"],
};

async function main() {
  const company = await prisma.company.upsert({
    where: { code: "DEFAULT" },
    update: {},
    create: {
      code: "DEFAULT",
      name: "Công ty mặc định (placeholder — cập nhật ở Phase 1)",
      baseCurrency: "VND",
    },
  });
  console.log(`Seeded default company: ${company.code} (${company.id})`);

  // Hệ thống tài khoản tối thiểu (docs/business-spec/08 mục 4.1) — Phase 8
  // (AP/AR/GL) chặn cứng nếu thiếu tài khoản đích khi tự động sinh bút toán
  // (xem src/modules/finance/lib/posting.ts), nên phải seed sẵn cho môi
  // trường dev chạy được ngay không cần tạo tay trước.
  const DEFAULT_ACCOUNTS: { code: string; name: string; type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" }[] = [
    { code: "111", name: "Tiền mặt", type: "ASSET" },
    { code: "112", name: "Tiền gửi ngân hàng", type: "ASSET" },
    { code: "131", name: "Phải thu khách hàng", type: "ASSET" },
    { code: "156", name: "Hàng hóa", type: "ASSET" },
    { code: "331", name: "Phải trả người bán", type: "LIABILITY" },
    { code: "511", name: "Doanh thu bán hàng", type: "REVENUE" },
    { code: "515", name: "Doanh thu hoạt động tài chính (lãi tỷ giá)", type: "REVENUE" },
    { code: "632", name: "Giá vốn hàng bán", type: "EXPENSE" },
    { code: "635", name: "Chi phí tài chính (lỗ tỷ giá)", type: "EXPENSE" },
    { code: "642", name: "Chi phí quản lý doanh nghiệp (lương)", type: "EXPENSE" },
  ];
  for (const acc of DEFAULT_ACCOUNTS) {
    await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: acc.code } },
      update: {},
      create: { companyId: company.id, code: acc.code, name: acc.name, type: acc.type },
    });
  }
  console.log(`Seeded ${DEFAULT_ACCOUNTS.length} default accounts.`);

  const permissionCodes: string[] = [];
  for (const resource of RESOURCES) {
    const actions = [...(ACTIONS_OVERRIDE[resource] ?? ACTIONS), ...(EXTRA_ACTIONS[resource] ?? [])];
    for (const action of actions) {
      const code = `${resource}:${action}`;
      permissionCodes.push(code);
      await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code, resource, action },
      });
    }
  }
  console.log(`Seeded ${permissionCodes.length} permissions.`);

  const adminRole = await prisma.role.upsert({
    where: { companyId_code: { companyId: company.id, code: "ADMIN" } },
    update: {},
    create: { companyId: company.id, code: "ADMIN", name: "Quản trị viên hệ thống" },
  });

  const permissions = await prisma.permission.findMany({ where: { code: { in: permissionCodes } } });
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }
  console.log(`Role ADMIN has ${permissions.length} permissions.`);

  const adminEmployee = await prisma.employee.upsert({
    where: { companyId_code: { companyId: company.id, code: "EMP-ADMIN" } },
    update: {},
    create: {
      companyId: company.id,
      code: "EMP-ADMIN",
      fullName: "Quản trị viên hệ thống",
      employeeType: "FULL_TIME",
      status: "ACTIVE",
    },
  });

  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: { employeeId: adminEmployee.id },
    create: {
      companyId: company.id,
      username: "admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      status: "ACTIVE",
      employeeId: adminEmployee.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log(
    `Seeded admin user: username="admin" password="Admin@123456" — ĐỔI MẬT KHẨU NÀY trước khi dùng thật.`
  );

  // Role MANAGER + user "manager" (Phase 10): Segregation of Duties
  // (docs/business-spec/12 mục 31-32) bắt buộc người tạo yêu cầu KHÔNG được
  // tự duyệt yêu cầu của chính mình — cần ít nhất 1 user thứ hai để
  // ApprovalMatrix có người duyệt độc lập với người tạo (vd. PO do admin tạo,
  // manager duyệt).
  const managerRole = await prisma.role.upsert({
    where: { companyId_code: { companyId: company.id, code: "MANAGER" } },
    update: {},
    create: { companyId: company.id, code: "MANAGER", name: "Quản lý duyệt" },
  });

  const managerPermissionCodes = ["approval-request:read", "approval-request:update", "notification:read"];
  const managerPermissions = await prisma.permission.findMany({ where: { code: { in: managerPermissionCodes } } });
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: permission.id },
    });
  }

  const managerEmployee = await prisma.employee.upsert({
    where: { companyId_code: { companyId: company.id, code: "EMP-MANAGER" } },
    update: {},
    create: {
      companyId: company.id,
      code: "EMP-MANAGER",
      fullName: "Quản lý phê duyệt",
      employeeType: "FULL_TIME",
      status: "ACTIVE",
    },
  });

  const managerPasswordHash = await bcrypt.hash("Manager@123456", 10);
  const managerUser = await prisma.user.upsert({
    where: { username: "manager" },
    update: { employeeId: managerEmployee.id },
    create: {
      companyId: company.id,
      username: "manager",
      email: "manager@example.com",
      passwordHash: managerPasswordHash,
      status: "ACTIVE",
      employeeId: managerEmployee.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: managerUser.id, roleId: managerRole.id } },
    update: {},
    create: { userId: managerUser.id, roleId: managerRole.id },
  });

  console.log(
    `Seeded manager user: username="manager" password="Manager@123456" — ĐỔI MẬT KHẨU NÀY trước khi dùng thật.`
  );

  // Approval Matrix mẫu cho PurchaseOrder (docs/business-spec/12 mục 6): 2 mốc
  // giá trị minh họa cơ chế phân cấp theo số tiền — công ty tự cấu hình lại
  // qua màn hình "Approval Matrix" (CRUD, xem approval-matrix.ts).
  await prisma.approvalMatrix.upsert({
    where: { id: `${company.id}-po-tier1` },
    update: {},
    create: {
      id: `${company.id}-po-tier1`,
      companyId: company.id,
      transactionType: "PurchaseOrder",
      minAmount: 0,
      maxAmount: 50_000_000,
      approverRoleId: managerRole.id,
    },
  });
  await prisma.approvalMatrix.upsert({
    where: { id: `${company.id}-po-tier2` },
    update: {},
    create: {
      id: `${company.id}-po-tier2`,
      companyId: company.id,
      transactionType: "PurchaseOrder",
      minAmount: 50_000_000,
      approverRoleId: adminRole.id,
    },
  });
  console.log("Seeded Approval Matrix mẫu cho PurchaseOrder (2 mốc giá trị).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
