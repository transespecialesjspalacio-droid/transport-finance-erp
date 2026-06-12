import NextAuth from "next-auth";
import { authMiddlewareConfig } from "@/lib/auth.middleware";

export default NextAuth(authMiddlewareConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
