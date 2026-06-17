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

async function getNextFacturaNumero(empresaId: string) {
  const rows: { facturaId: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT factura_id AS "facturaId" FROM "cuentas_cobrar"
     WHERE "empresa_id" = $1 AND factura_id IS NOT NULL
     ORDER BY factura_id DESC LIMIT 1`,
    empresaId
  );
  const latest = rows[0]?.facturaId;
  const consecutive = latest ? (parseInt(latest.match(/FAC-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  return `FAC-${String(consecutive).padStart(6, "0")}`;
}

async function getNextCxpNumero(empresaId: string) {
  const rows: { numero: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT numero FROM "cuentas_pagar"
     WHERE "empresa_id" = $1 AND numero IS NOT NULL
     ORDER BY numero DESC LIMIT 1`,
    empresaId
  );
  const latest = rows[0]?.numero;
  const consecutive = latest ? (parseInt(latest.match(/CXP-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  return `CXP-${String(consecutive).padStart(6, "0")}`;
}

export async function createServicio(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = servicioSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fecha, horaSalida, fechaRegreso, horaRegreso, horaInicio, horaFin, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, codigo: _codigo, pasajeros, realizadoPor, terceroId, valorAPagar, fechaVencimientoPago, ...rest } = parsed.data; void _codigo;

  const rows: { codigo: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT codigo FROM "servicios"
     WHERE "empresa_id" = $1 AND codigo IS NOT NULL
     ORDER BY codigo DESC LIMIT 1`,
    session.user.empresaId
  );
  const latest = rows[0]?.codigo;
  const consecutive = latest ? (parseInt(latest.match(/SER-(\d+)/)?.[1] ?? "0", 10) + 1) : 1;
  const codigo = `SER-${String(consecutive).padStart(6, "0")}`;

  const servicio = await prisma.servicio.create({
    data: {
      ...rest,
      codigo,
      empresaId: session.user.empresaId,
      vehiculoId: vehiculoId || null,
      conductorId: conductorId || null,
      fecha: new Date(fecha),
      horaSalida: horaSalida ? new Date(`${fecha}T${horaSalida}`) : null,
      fechaRegreso: fechaRegreso ? new Date(fechaRegreso) : null,
      horaRegreso: horaRegreso ? new Date(`${fechaRegreso || fecha}T${horaRegreso}`) : null,
      horaInicio: horaInicio ? new Date(`${fecha}T${horaInicio}`) : null,
      horaFin: horaFin ? new Date(`${fecha}T${horaFin}`) : null,
      pasajeros: pasajeros ? Number(pasajeros) : null,
      tarifaAplicada: Number(tarifaAplicada),
      ingresoEsperado: ingresoEsperado ? Number(ingresoEsperado) : Number(tarifaAplicada),
      ingresoReal: ingresoReal ? Number(ingresoReal) : null,
      realizadoPor: (realizadoPor as "PROPIO" | "TERCERO" | undefined) ?? "PROPIO",
      terceroId: terceroId || null,
      valorAPagar: valorAPagar ? Number(valorAPagar) : null,
      fechaVencimientoPago: fechaVencimientoPago ? new Date(fechaVencimientoPago) : null,
    },
  });

  await generarCxC(session.user.empresaId, servicio.id, Number(ingresoEsperado || tarifaAplicada));
  if (realizadoPor === "TERCERO" && valorAPagar && Number(valorAPagar) > 0) {
    await generarCxP(session.user.empresaId, servicio.id, terceroId || null, Number(valorAPagar), fechaVencimientoPago || null);
  }

  revalidatePath("/servicios");
  redirect("/servicios");
}

export async function updateServicio(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = servicioSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const { fecha, horaSalida, fechaRegreso, horaRegreso, horaInicio, horaFin, tarifaAplicada, ingresoEsperado, ingresoReal, vehiculoId, conductorId, codigo: _codigo, pasajeros, realizadoPor, terceroId, valorAPagar, fechaVencimientoPago, ...rest } = parsed.data; void _codigo;

  await prisma.servicio.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...rest,
      vehiculoId: vehiculoId || null,
      conductorId: conductorId || null,
      fecha: new Date(fecha),
      horaSalida: horaSalida ? new Date(`${fecha}T${horaSalida}`) : null,
      fechaRegreso: fechaRegreso ? new Date(fechaRegreso) : null,
      horaRegreso: horaRegreso ? new Date(`${fechaRegreso || fecha}T${horaRegreso}`) : null,
      horaInicio: horaInicio ? new Date(`${fecha}T${horaInicio}`) : null,
      horaFin: horaFin ? new Date(`${fecha}T${horaFin}`) : null,
      pasajeros: pasajeros ? Number(pasajeros) : null,
      tarifaAplicada: Number(tarifaAplicada),
      ingresoEsperado: ingresoEsperado ? Number(ingresoEsperado) : Number(tarifaAplicada),
      ingresoReal: ingresoReal ? Number(ingresoReal) : null,
      realizadoPor: (realizadoPor as "PROPIO" | "TERCERO" | undefined) ?? "PROPIO",
      terceroId: terceroId || null,
      valorAPagar: valorAPagar ? Number(valorAPagar) : null,
      fechaVencimientoPago: fechaVencimientoPago ? new Date(fechaVencimientoPago) : null,
    },
  });

  await sincronizarCxC(session.user.empresaId, id, Number(ingresoEsperado || tarifaAplicada));
  await sincronizarCxP(session.user.empresaId, id, realizadoPor as string | undefined, terceroId, valorAPagar, fechaVencimientoPago);

  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
  redirect("/servicios");
}

export async function deleteServicio(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await cancelarCxC(session.user.empresaId, id);
  await cancelarCxP(session.user.empresaId, id);

  await prisma.servicio.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/servicios");
}

async function generarCxC(empresaId: string, servicioId: string, monto: number) {
  if (monto <= 0) return;
  const servicio = await prisma.servicio.findFirst({
    where: { id: servicioId, empresaId },
    select: { contratoId: true, fecha: true, contrato: { select: { clienteId: true } } },
  });
  if (!servicio) return;

  const facturaId = await getNextFacturaNumero(empresaId);

  await prisma.cuentaCobrar.create({
    data: {
      empresaId,
      clienteId: servicio.contrato.clienteId,
      contratoId: servicio.contratoId,
      servicioId,
      facturaId,
      montoTotal: monto,
      saldoPendiente: monto,
      fechaEmision: servicio.fecha,
      fechaVencimiento: new Date(servicio.fecha.getTime() + 30 * 24 * 60 * 60 * 1000),
      estado: "PENDIENTE",
      origen: "SERVICIO_AUTOMATICO",
    },
  });
}

async function sincronizarCxC(empresaId: string, servicioId: string, monto: number) {
  const cxc = await prisma.cuentaCobrar.findFirst({
    where: { servicioId, empresaId, origen: "SERVICIO_AUTOMATICO" },
    select: { id: true, saldoPendiente: true, montoTotal: true },
  });
  if (!cxc && monto > 0) {
    await generarCxC(empresaId, servicioId, monto);
    return;
  }
  if (!cxc) return;

  const cobrado = Number(cxc.montoTotal) - Number(cxc.saldoPendiente);
  const nuevoSaldo = monto - cobrado;

  if (nuevoSaldo < 0) {
    await prisma.cuentaCobrar.updateMany({
      where: { id: cxc.id, empresaId },
      data: {
        montoTotal: monto,
        saldoPendiente: 0,
        estado: "PAGADO",
      },
    });
    return;
  }

  await prisma.cuentaCobrar.updateMany({
    where: { id: cxc.id, empresaId },
    data: {
      montoTotal: monto,
      saldoPendiente: nuevoSaldo,
      estado: nuevoSaldo === 0 ? "PAGADO" : nuevoSaldo < monto ? "PARCIAL" : "PENDIENTE",
    },
  });
}

async function cancelarCxC(empresaId: string, servicioId: string) {
  await prisma.cuentaCobrar.updateMany({
    where: { servicioId, empresaId, origen: "SERVICIO_AUTOMATICO" },
    data: { estado: "CANCELADO" },
  });
}

async function generarCxP(empresaId: string, servicioId: string, terceroId: string | null, monto: number, fechaVencimiento: string | null) {
  if (monto <= 0 || !terceroId) return;

  const servicio = await prisma.servicio.findFirst({
    where: { id: servicioId, empresaId },
    select: { fecha: true },
  });
  if (!servicio) return;

  const numero = await getNextCxpNumero(empresaId);

  await prisma.cuentaPagar.create({
    data: {
      empresaId,
      terceroId,
      servicioId,
      numero,
      montoTotal: monto,
      saldoPendiente: monto,
      fechaEmision: servicio.fecha,
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : new Date(servicio.fecha.getTime() + 30 * 24 * 60 * 60 * 1000),
      estado: "PENDIENTE",
      origen: "SERVICIO_TERCERO",
    },
  });
}

async function sincronizarCxP(empresaId: string, servicioId: string, realizadoPor: string | undefined, terceroId: string | undefined, valorAPagar: string | undefined, fechaVencimientoPago: string | undefined) {
  const cxp = await prisma.cuentaPagar.findFirst({
    where: { servicioId, empresaId, origen: "SERVICIO_TERCERO" },
    select: { id: true, saldoPendiente: true, montoTotal: true },
  });

  const monto = valorAPagar ? Number(valorAPagar) : 0;
  const esTercero = realizadoPor === "TERCERO";

  if (!cxp && esTercero && monto > 0 && terceroId) {
    await generarCxP(empresaId, servicioId, terceroId, monto, fechaVencimientoPago || null);
    return;
  }

  if (cxp) {
    if (!esTercero || monto <= 0) {
      await prisma.cuentaPagar.updateMany({
        where: { id: cxp.id, empresaId },
        data: { estado: "CANCELADO" },
      });
      return;
    }
    const pagado = Number(cxp.montoTotal) - Number(cxp.saldoPendiente);
    const nuevoSaldo = monto - pagado;

    if (nuevoSaldo < 0) {
      await prisma.cuentaPagar.updateMany({
        where: { id: cxp.id, empresaId },
        data: { montoTotal: monto, saldoPendiente: 0, estado: "PAGADO" },
      });
      return;
    }
    await prisma.cuentaPagar.updateMany({
      where: { id: cxp.id, empresaId },
      data: {
        montoTotal: monto,
        saldoPendiente: nuevoSaldo,
        estado: nuevoSaldo === 0 ? "PAGADO" : "PENDIENTE",
      },
    });
  }
}

async function cancelarCxP(empresaId: string, servicioId: string) {
  await prisma.cuentaPagar.updateMany({
    where: { servicioId, empresaId, origen: "SERVICIO_TERCERO" },
    data: { estado: "CANCELADO" },
  });
}
