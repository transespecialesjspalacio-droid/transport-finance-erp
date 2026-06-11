"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { contratoSchema } from "../schemas/contrato-schema";

export async function createContrato(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = contratoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fechaInicio, fechaFin, montoMensual, ...rest } = parsed.data;

  await prisma.contrato.create({
    data: {
      ...rest,
      empresaId: session.user.empresaId,
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

  const { fechaInicio, fechaFin, montoMensual, ...rest } = parsed.data;

  await prisma.contrato.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...rest,
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
