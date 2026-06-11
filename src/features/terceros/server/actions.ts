"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { terceroSchema } from "../schemas/tercero-schema";
import { generateCodigo, getNextConsecutive } from "@/lib/codigo";

export async function createTercero(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = terceroSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const consecutive = await getNextConsecutive(session.user.empresaId, "tercero", prisma);
  const codigo = generateCodigo(parsed.data.nombre, consecutive);

  await prisma.tercero.create({
    data: { ...parsed.data, codigo, empresaId: session.user.empresaId },
  });

  revalidatePath("/terceros");
  redirect("/terceros");
}

export async function updateTercero(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = terceroSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  await prisma.tercero.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: parsed.data,
  });

  revalidatePath("/terceros");
  revalidatePath(`/terceros/${id}`);
  redirect("/terceros");
}

export async function deleteTercero(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.tercero.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/terceros");
}
