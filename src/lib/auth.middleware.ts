import type { NextAuthConfig } from "next-auth";

export const authMiddlewareConfig: NextAuthConfig = {
  providers: [],
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
  },
};
