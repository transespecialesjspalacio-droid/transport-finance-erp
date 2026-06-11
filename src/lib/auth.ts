import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.usuario.findUnique({
          where: { email },
          include: { empresa: true },
        });

        if (!user || !user.active) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const userResult = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          empresaId: user.empresaId,
        };

        console.log("AUTHORIZE_DEBUG", userResult);
        return userResult;
      },
    }),
  ],
});
