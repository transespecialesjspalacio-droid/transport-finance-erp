import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function authorize(credentials: Record<string, unknown> | undefined) {
  const { email, password } = credentials as Record<string, string>;

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
}
