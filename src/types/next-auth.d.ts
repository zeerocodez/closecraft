import type { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface User { organizationId?: string | null; }
  interface Session {
    user: { id: string } & DefaultSession["user"];
    organizationId: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; organizationId?: string | null; }
}
