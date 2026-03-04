// Prisma 7 configuration file — used by the Prisma CLI for migrations and Studio.
// The runtime adapter (PrismaMariaDb) is configured separately in src/lib/prisma.ts.
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
