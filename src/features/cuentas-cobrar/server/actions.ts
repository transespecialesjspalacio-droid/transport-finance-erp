"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cuentaCobrarSchema, cobroSchema } from "../schemas/cuenta-cobrar-schema";

export async function getNextFacturaPreview() {
  const session = await auth();
  if (!session?.user?.empresaId) return "";

  const rows: { facturaId: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT factura_id AS "facturaId" FROM "cuentas_cobrar"
     WHERE "empresa_id" = $1 AND factura_id IS NOT NULL
     ORDER BY factura_id DESC LIMIT 1`,
    session.user.empresaId
  );

  const latest = rows[0]?.facturaId;
  const consecutive = latest ? (parseInt(latest.match(/FAC-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  return `FAC-${String(consecutive).padStart(6, "0")}`;
}

export async function createCuentaCobrar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = cuentaCobrarSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const montoTotal = parseFloat(parsed.data.montoTotal);
  if (isNaN(montoTotal) || montoTotal <= 0) throw new Error("Monto total inválido");

  const rows: { facturaId: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT factura_id AS "facturaId" FROM "cuentas_cobrar"
     WHERE "empresa_id" = $1 AND factura_id IS NOT NULL
     ORDER BY factura_id DESC LIMIT 1`,
    session.user.empresaId
  );
  const latest = rows[0]?.facturaId;
  const consecutive = latest ? (parseInt(latest.match(/FAC-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  const facturaId = `FAC-${String(consecutive).padStart(6, "0")}`;

  await prisma.cuentaCobrar.create({
    data: {
      empresaId: session.user.empresaId,
      clienteId: parsed.data.clienteId,
      contratoId: parsed.data.contratoId,
      servicioId: parsed.data.servicioId || null,
      facturaId,
      montoTotal,
      saldoPendiente: montoTotal,
      fechaEmision: new Date(parsed.data.fechaEmision),
      fechaVencimiento: new Date(parsed.data.fechaVencimiento),
    },
  });

  revalidatePath("/cuentas-cobrar");
  redirect("/cuentas-cobrar");
}

export async function updateCuentaCobrar(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = cuentaCobrarSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const montoTotal = parseFloat(parsed.data.montoTotal);
  if (isNaN(montoTotal) || montoTotal <= 0) throw new Error("Monto total inválido");

  const cuenta = await prisma.cuentaCobrar.findFirst({
    where: { id, empresaId: session.user.empresaId },
    select: { saldoPendiente: true, montoTotal: true },
  });
  if (!cuenta) throw new Error("No encontrada");

  const cobrado = Number(cuenta.montoTotal) - Number(cuenta.saldoPendiente);
  const nuevoSaldo = montoTotal - cobrado;

  if (nuevoSaldo < 0) throw new Error("El nuevo monto total no puede ser menor a lo ya cobrado");

  const estado = nuevoSaldo === 0 ? "PAGADO" : nuevoSaldo < montoTotal ? "PARCIAL" : "PENDIENTE";

  await prisma.cuentaCobrar.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      clienteId: parsed.data.clienteId,
      contratoId: parsed.data.contratoId,
      servicioId: parsed.data.servicioId || null,
      montoTotal,
      saldoPendiente: nuevoSaldo,
      fechaEmision: new Date(parsed.data.fechaEmision),
      fechaVencimiento: new Date(parsed.data.fechaVencimiento),
      estado: estado as "PENDIENTE" | "PARCIAL" | "PAGADO",
    },
  });

  revalidatePath("/cuentas-cobrar");
  revalidatePath(`/cuentas-cobrar/${id}`);
  redirect("/cuentas-cobrar");
}

export async function deleteCuentaCobrar(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.cuentaCobrar.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/cuentas-cobrar");
}

export async function registerCobro(cuentaCobrarId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = cobroSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const monto = parseFloat(parsed.data.monto);
  if (isNaN(monto) || monto <= 0) throw new Error("Monto inválido");

  const cuenta = await prisma.cuentaCobrar.findFirst({
    where: { id: cuentaCobrarId, empresaId: session.user.empresaId },
    select: { id: true, saldoPendiente: true },
  });
  if (!cuenta) throw new Error("Cuenta no encontrada");
  if (monto > Number(cuenta.saldoPendiente)) throw new Error("El cobro excede el saldo pendiente");

  await prisma.$transaction([
    prisma.cobro.create({
      data: {
        cuentaCobrarId: cuenta.id,
        monto,
        fechaPago: new Date(parsed.data.fechaPago),
        metodoPago: parsed.data.metodoPago as "TRANSFERENCIA" | "CHEQUE" | "EFECTIVO" | "TARJETA",
        referencia: parsed.data.referencia || null,
      },
    }),
    prisma.cuentaCobrar.update({
      where: { id: cuenta.id },
      data: {
        saldoPendiente: { decrement: monto },
      },
    }),
  ]);

  const cuentaActualizada = await prisma.cuentaCobrar.findUnique({
    where: { id: cuenta.id },
    select: { saldoPendiente: true, montoTotal: true },
  });

  if (cuentaActualizada) {
    const nuevoSaldo = Number(cuentaActualizada.saldoPendiente);
    const nuevoEstado = nuevoSaldo === 0 ? "PAGADO" : "PARCIAL";
    await prisma.cuentaCobrar.update({
      where: { id: cuenta.id },
      data: { estado: nuevoEstado as "PARCIAL" | "PAGADO" },
    });
  }

  revalidatePath("/cuentas-cobrar");
  revalidatePath(`/cuentas-cobrar/${cuentaCobrarId}`);
}
