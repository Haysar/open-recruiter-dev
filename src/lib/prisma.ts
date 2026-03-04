// Prisma 7 uses driver adapters instead of a binary query engine.
// For MySQL/MariaDB we use @prisma/adapter-mariadb with the connection URL.
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/generated/prisma/client"

// Prevent multiple PrismaClient instances in development due to hot-reloading.
// In production a single instance is created and reused for the process lifetime.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
