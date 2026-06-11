"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { servicioSchema } from "../schemas/servicio-schema";

export async function createServicio(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = servicioSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fecha, horaInicio, horaFin, distanciaKm, kmRecorridos, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, ...rest } = parsed.data;

  await prisma.servicio.create({
    data: {
      ...rest,
      empresaId: session.user.empresaId,
      vehiculoId: vehiculoId || null,
      conductorId: conductorId || null,
      fecha: new Date(fecha),
      horaInicio: horaInicio ? new Date(`${fecha}T${horaInicio}`) : null,
      horaFin: horaFin ? new Date(`${fecha}T${horaFin}`) : null,
      distanciaKm: distanciaKm ? Number(distanciaKm) : null,
      kmRecorridos: kmRecorridos ? Number(kmRecorridos) : null,
      tarifaAplicada: Number(tarifaAplicada),
      ingresoEsperado: ingresoEsperado ? Number(ingresoEsperado) : Number(tarifaAplicada),
      ingresoReal: ingresoReal ? Number(ingresoReal) : null,
    },
  });

  revalidatePath("/servicios");
  redirect("/servicios");
}

export async function updateServicio(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = servicioSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fecha, horaInicio, horaFin, distanciaKm, kmRecorridos, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, ...rest } = parsed.data;

  await prisma.servicio.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...rest,
      vehiculoId: vehiculoId || null,
      conductorId: conductorId || null,
      fecha: new Date(fecha),
      horaInicio: horaInicio ? new Date(`${fecha}T${horaInicio}`) : null,
      horaFin: horaFin ? new Date(`${fecha}T${horaFin}`) : null,
      distanciaKm: distanciaKm ? Number(distanciaKm) : null,
      kmRecorridos: kmRecorridos ? Number(kmRecorridos) : null,
      tarifaAplicada: Number(tarifaAplicada),
      ingresoEsperado: ingresoEsperado ? Number(ingresoEsperado) : Number(tarifaAplicada),
      ingresoReal: ingresoReal ? Number(ingresoReal) : null,
    },
  });

  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
  redirect("/servicios");
}

export async function deleteServicio(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.servicio.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/servicios");
}
