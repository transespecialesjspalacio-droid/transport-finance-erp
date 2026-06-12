"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cuentaPagarSchema, pagoSchema } from "../schemas/cuenta-pagar-schema";

export async function getNextCuentaPagarNumero() {
  const session = await auth();
  if (!session?.user?.empresaId) return 1;

  const rows: { numero: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT numero FROM "cuentas_pagar"
     WHERE "empresa_id" = $1 AND numero IS NOT NULL
     ORDER BY numero DESC LIMIT 1`,
    session.user.empresaId
  );

  const latest = rows[0]?.numero;
  if (!latest) return 1;

  const match = latest.match(/CXP-(\d+)/);
  return match ? parseInt(match[1], 10) + 1 : 1;
}

export async function createCuentaPagar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = cuentaPagarSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const montoTotal = parseFloat(parsed.data.montoTotal);
  if (isNaN(montoTotal) || montoTotal <= 0) throw new Error("Monto total inválido");

  const rows: { numero: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT numero FROM "cuentas_pagar"
     WHERE "empresa_id" = $1 AND numero IS NOT NULL
     ORDER BY numero DESC LIMIT 1`,
    session.user.empresaId
  );
  const latest = rows[0]?.numero;
  const consecutive = latest ? (parseInt(latest.match(/CXP-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  const numero = `CXP-${String(consecutive).padStart(6, "0")}`;

  await prisma.cuentaPagar.create({
    data: {
      empresaId: session.user.empresaId,
      terceroId: parsed.data.terceroId,
      servicioId: parsed.data.servicioId || null,
      numero,
      montoTotal,
      saldoPendiente: montoTotal,
      fechaEmision: new Date(parsed.data.fechaEmision),
      fechaVencimiento: new Date(parsed.data.fechaVencimiento),
    },
  });

  revalidatePath("/cuentas-pagar");
  redirect("/cuentas-pagar");
}

export async function updateCuentaPagar(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = cuentaPagarSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const montoTotal = parseFloat(parsed.data.montoTotal);
  if (isNaN(montoTotal) || montoTotal <= 0) throw new Error("Monto total inválido");

  const cuenta = await prisma.cuentaPagar.findFirst({
    where: { id, empresaId: session.user.empresaId },
    select: { saldoPendiente: true, montoTotal: true },
  });
  if (!cuenta) throw new Error("No encontrada");

  const pagado = Number(cuenta.montoTotal) - Number(cuenta.saldoPendiente);
  const nuevoSaldo = montoTotal - pagado;

  if (nuevoSaldo < 0) throw new Error("El nuevo monto total no puede ser menor a lo ya pagado");

  const estado = nuevoSaldo === 0 ? "PAGADO" : nuevoSaldo < montoTotal ? "PARCIAL" : "PENDIENTE";

  await prisma.cuentaPagar.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      terceroId: parsed.data.terceroId,
      servicioId: parsed.data.servicioId || null,
      montoTotal,
      saldoPendiente: nuevoSaldo,
      fechaEmision: new Date(parsed.data.fechaEmision),
      fechaVencimiento: new Date(parsed.data.fechaVencimiento),
      estado: estado as "PENDIENTE" | "PARCIAL" | "PAGADO",
    },
  });

  revalidatePath("/cuentas-pagar");
  revalidatePath(`/cuentas-pagar/${id}`);
  redirect("/cuentas-pagar");
}

export async function deleteCuentaPagar(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.cuentaPagar.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/cuentas-pagar");
}

export async function registerPago(cuentaPagarId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = pagoSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const monto = parseFloat(parsed.data.monto);
  if (isNaN(monto) || monto <= 0) throw new Error("Monto inválido");

  const cuenta = await prisma.cuentaPagar.findFirst({
    where: { id: cuentaPagarId, empresaId: session.user.empresaId },
    select: { id: true, saldoPendiente: true },
  });
  if (!cuenta) throw new Error("Cuenta no encontrada");
  if (monto > Number(cuenta.saldoPendiente)) throw new Error("El pago excede el saldo pendiente");

  await prisma.$transaction([
    prisma.pago.create({
      data: {
        cuentaPagarId: cuenta.id,
        monto,
        fechaPago: new Date(parsed.data.fechaPago),
        metodoPago: parsed.data.metodoPago as "TRANSFERENCIA" | "CHEQUE" | "EFECTIVO" | "TARJETA",
        referencia: parsed.data.referencia || null,
      },
    }),
    prisma.cuentaPagar.update({
      where: { id: cuenta.id },
      data: {
        saldoPendiente: { decrement: monto },
      },
    }),
  ]);

  const cuentaActualizada = await prisma.cuentaPagar.findUnique({
    where: { id: cuenta.id },
    select: { saldoPendiente: true, montoTotal: true },
  });

  if (cuentaActualizada) {
    const nuevoSaldo = Number(cuentaActualizada.saldoPendiente);
    const nuevoEstado = nuevoSaldo === 0 ? "PAGADO" : "PARCIAL";
    await prisma.cuentaPagar.update({
      where: { id: cuenta.id },
      data: { estado: nuevoEstado as "PARCIAL" | "PAGADO" },
    });
  }

  revalidatePath("/cuentas-pagar");
  revalidatePath(`/cuentas-pagar/${cuentaPagarId}`);
}
