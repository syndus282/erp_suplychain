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
] as const;

const ACTIONS = ["read", "create", "update"] as const;

/** Action đặc thù ngoài read/create/update, chỉ áp dụng cho 1 số resource. */
const EXTRA_ACTIONS: Partial<Record<(typeof RESOURCES)[number], string[]>> = {
  "purchase-order": ["approve"],
  "stock-transfer": ["ship", "receive"],
  "stock-count": ["submit", "approve"],
  "consignment-shipment": ["deliver"],
  "stock-recall": ["receive"],
  quotation: ["send", "accept", "reject", "convert"],
  "sales-order": ["confirm", "allocate", "cancel"],
  "sales-return": ["approve", "reject", "receive", "qc", "refund"],
  shipment: ["dispatch", "pod", "close"],
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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
