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
] as const;

const ACTIONS = ["read", "create", "update"] as const;

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
    for (const action of ACTIONS) {
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

  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      companyId: company.id,
      username: "admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      status: "ACTIVE",
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
