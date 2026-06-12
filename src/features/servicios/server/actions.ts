"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { servicioSchema } from "../schemas/servicio-schema";

export async function getNextServicioCodigo() {
  const session = await auth();
  if (!session?.user?.empresaId) return 1;

  const rows: { codigo: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT codigo FROM "servicios"
     WHERE "empresa_id" = $1 AND codigo IS NOT NULL
     ORDER BY codigo DESC LIMIT 1`,
    session.user.empresaId
  );

  const latest = rows[0]?.codigo;
  if (!latest) return 1;

  const match = latest.match(/SER-(\d+)/);
  return match ? parseInt(match[1], 10) + 1 : 1;
}

export async function createServicio(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = servicioSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fecha, horaInicio, horaFin, distanciaKm, kmRecorridos, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, codigo: _codigo, ...rest } = parsed.data; void _codigo;

  const rows: { codigo: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT codigo FROM "servicios"
     WHERE "empresa_id" = $1 AND codigo IS NOT NULL
     ORDER BY codigo DESC LIMIT 1`,
    session.user.empresaId
  );
  const latest = rows[0]?.codigo;
  const consecutive = latest ? (parseInt(latest.match(/SER-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  const codigo = `SER-${String(consecutive).padStart(6, "0")}`;

  await prisma.servicio.create({
    data: {
      ...rest,
      codigo,
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

  const { fecha, horaInicio, horaFin, distanciaKm, kmRecorridos, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, codigo: _codigo, ...rest } = parsed.data; void _codigo;

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
