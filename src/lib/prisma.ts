// Prisma 7 uses driver adapters instead of a binary query engine.
// For PostgreSQL we use @prisma/adapter-pg with a pg.Pool connection.
import { PgAdapter } from "@prisma/adapter-pg"
import pg from "pg"
import { PrismaClient } from "@/generated/prisma/client"

// Prevent multiple PrismaClient instances in development due to hot-reloading.
// In production a single instance is created and reused for the process lifetime.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PgAdapter(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
