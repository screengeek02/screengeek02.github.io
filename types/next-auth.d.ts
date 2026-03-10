import NextAuth from "next-auth"
import { DefaultSession } from "next-auth"

export type UserRole =
  | "RESEARCHER"
  | "INSTITUTION_ADMIN"
  | "COUNTRY_COORDINATOR"
  | "SUPER_ADMIN"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    email?: string
    name?: string
  }
}
