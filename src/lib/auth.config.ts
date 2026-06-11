import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || 
        ["/clientes", "/contratos", "/servicios", "/costos", "/proveedores",
         "/vehiculos", "/conductores", "/terceros", "/cuentas-cobrar", "/cuentas-pagar",
         "/flujo-caja", "/reportes"].some(p => nextUrl.pathname.startsWith(p));
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.empresaId = (user as { empresaId?: string }).empresaId;
      }
      console.log("JWT_DEBUG", {
        id: token.id,
        role: token.role,
        empresaId: token.empresaId,
      });
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.empresaId = token.empresaId as string;
      }
      console.log("SESSION_DEBUG", {
        id: session.user?.id,
        role: session.user?.role,
        empresaId: session.user?.empresaId,
      });
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { authorize: authorizeFn } = await import("./authorize");
        return authorizeFn(credentials);
      },
    }),
  ],
};
