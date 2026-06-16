import { authMiddlewareConfig } from "./auth.middleware";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  ...authMiddlewareConfig,
  callbacks: {
    ...authMiddlewareConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        // Google sign-in: fetch DB user to populate custom fields
        const email = token.email ?? user.email;
        if (email) {
          const dbUser = await prisma.usuario.findUnique({
            where: { email },
            select: { id: true, role: true, empresaId: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.empresaId = dbUser.empresaId;
          }
        }
      } else if (user) {
        // Credentials sign-in: data already in user object
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.empresaId = (user as { empresaId?: string }).empresaId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.empresaId = token.empresaId as string;
      }
      return session;
    },
    signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;
        const email = profile.email;
        return new Promise(async (resolve) => {
          try {
            const user = await prisma.usuario.findUnique({
              where: { email },
              select: { id: true, googleEnabled: true, active: true },
            });
            if (!user || !user.active || !user.googleEnabled) {
              resolve(false);
              return;
            }
            resolve(true);
          } catch {
            resolve(false);
          }
        });
      }
      return true;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { authorize: authorizeFn } = await import("./authorize");
        return authorizeFn(credentials);
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
};
