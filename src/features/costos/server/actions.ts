"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { costoSchema } from "../schemas/costo-schema";

export async function createCosto(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = costoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const monto = Number(parsed.data.monto);
  const cantidad = parsed.data.cantidad ? Number(parsed.data.cantidad) : 1;
  const total = monto * cantidad;

  await prisma.costoServicio.create({
    data: {
      servicioId: parsed.data.servicioId,
      empresaId: session.user.empresaId,
      tipoCostoId: parsed.data.tipoCostoId,
      terceroId: parsed.data.terceroId || null,
      descripcion: parsed.data.descripcion,
      monto,
      cantidad,
      total,
      fecha: new Date(parsed.data.fecha),
    },
  });

  revalidatePath("/costos");
  redirect("/costos");
}

export async function updateCosto(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = costoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const monto = Number(parsed.data.monto);
  const cantidad = parsed.data.cantidad ? Number(parsed.data.cantidad) : 1;
  const total = monto * cantidad;

  await prisma.costoServicio.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      servicioId: parsed.data.servicioId,
      tipoCostoId: parsed.data.tipoCostoId,
      terceroId: parsed.data.terceroId || null,
      descripcion: parsed.data.descripcion,
      monto,
      cantidad,
      total,
      fecha: new Date(parsed.data.fecha),
    },
  });

  revalidatePath("/costos");
  revalidatePath(`/costos/${id}`);
  redirect("/costos");
}

export async function deleteCosto(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.costoServicio.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/costos");
}
