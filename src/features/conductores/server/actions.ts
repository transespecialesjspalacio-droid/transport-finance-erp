"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { conductorSchema } from "../schemas/conductor-schema";

export async function createConductor(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = conductorSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const data = {
    ...parsed.data,
    fechaVencimiento: parsed.data.fechaVencimiento ? new Date(parsed.data.fechaVencimiento) : null,
    empresaId: session.user.empresaId,
  };

  await prisma.conductor.create({ data });

  revalidatePath("/conductores");
  redirect("/conductores");
}

export async function updateConductor(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = conductorSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const data = {
    ...parsed.data,
    fechaVencimiento: parsed.data.fechaVencimiento ? new Date(parsed.data.fechaVencimiento) : null,
  };

  await prisma.conductor.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data,
  });

  revalidatePath("/conductores");
  revalidatePath(`/conductores/${id}`);
  redirect("/conductores");
}

export async function deleteConductor(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.conductor.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/conductores");
}
