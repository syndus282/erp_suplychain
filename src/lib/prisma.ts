import { PrismaClient } from "@prisma/client";

// Singleton Prisma Client — tránh mở quá nhiều connection khi Next.js hot-reload
// trong dev (mỗi lần reload module sẽ tạo instance mới nếu không cache lại).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
