import type { UserRole } from "@/generated/prisma/client"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extends the built-in Session type so `session.user.id` and
   * `session.user.role` are available everywhere without casting.
   */
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
}
