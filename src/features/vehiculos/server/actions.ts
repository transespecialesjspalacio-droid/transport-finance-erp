"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vehiculoSchema } from "../schemas/vehiculo-schema";

export async function createVehiculo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = vehiculoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  await prisma.vehiculo.create({
    data: {
      ...parsed.data,
      anio: Number(parsed.data.anio),
      capacidad: Number(parsed.data.capacidad),
      empresaId: session.user.empresaId,
    },
  });

  revalidatePath("/vehiculos");
  redirect("/vehiculos");
}

export async function updateVehiculo(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = vehiculoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  await prisma.vehiculo.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...parsed.data,
      anio: Number(parsed.data.anio),
      capacidad: Number(parsed.data.capacidad),
    },
  });

  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${id}`);
  redirect("/vehiculos");
}

export async function deleteVehiculo(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.vehiculo.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/vehiculos");
}
