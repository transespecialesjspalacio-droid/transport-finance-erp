"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Periodicidad } from "@prisma/client";
import { contratoSchema } from "../schemas/contrato-schema";

export async function createContrato(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = contratoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  let codigo = parsed.data.codigo;
  const { fechaInicio, fechaFin, montoMensual, periodicidad, valorRecurrente, rentabilidadBase, diaCorte, ...rest } = parsed.data;

  if (!codigo) {
    const cliente = await prisma.cliente.findFirst({
      where: { id: rest.clienteId, empresaId: session.user.empresaId },
      select: { codigo: true, rfc: true },
    });
    codigo = cliente?.codigo ?? cliente?.rfc ?? "SIN-CODIGO";
  }

  await prisma.contrato.create({
    data: {
      ...rest,
      codigo,
      empresaId: session.user.empresaId,
      periodicidad: (periodicidad || null) as Periodicidad | null,
      valorRecurrente: valorRecurrente ? Number(valorRecurrente) : null,
      rentabilidadBase: rentabilidadBase ? Number(rentabilidadBase) : null,
      diaCorte: diaCorte ? Number(diaCorte) : null,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      montoMensual: montoMensual ? Number(montoMensual) : null,
    },
  });

  revalidatePath("/contratos");
  redirect("/contratos");
}

export async function updateContrato(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = contratoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fechaInicio, fechaFin, montoMensual, periodicidad, valorRecurrente, rentabilidadBase, diaCorte, ...rest } = parsed.data;

  await prisma.contrato.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...rest,
      periodicidad: (periodicidad || null) as Periodicidad | null,
      valorRecurrente: valorRecurrente ? Number(valorRecurrente) : null,
      rentabilidadBase: rentabilidadBase ? Number(rentabilidadBase) : null,
      diaCorte: diaCorte ? Number(diaCorte) : null,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      montoMensual: montoMensual ? Number(montoMensual) : null,
    },
  });

  revalidatePath("/contratos");
  revalidatePath(`/contratos/${id}`);
  redirect("/contratos");
}

export async function deleteContrato(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.contrato.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/contratos");
}
