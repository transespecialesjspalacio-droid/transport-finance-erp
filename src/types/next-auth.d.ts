import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    empresaId?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      empresaId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    empresaId?: string;
  }
}
