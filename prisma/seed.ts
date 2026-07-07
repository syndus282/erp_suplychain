// Seed dữ liệu khởi tạo tối thiểu cho môi trường dev — hiện tại chỉ seed 1 Company
// mặc định theo docs/ROADMAP.md ("Phase 0 ... seed 1 company mặc định").
// Chạy: npm run prisma:seed (hoặc `prisma db seed`, tự động chạy sau `prisma migrate reset`).
//
// Company.code/name là placeholder — cập nhật lại khi có thông tin pháp lý thật
// của doanh nghiệp (mã số thuế, địa chỉ...), không hard-code thêm dữ liệu nghiệp
// vụ nào khác ở đây (Master Data thật thuộc Phase 1).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
