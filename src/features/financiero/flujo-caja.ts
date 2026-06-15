import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type Periodo = "semana" | "mes" | "trimestre" | "anio";

export interface FlujoCajaEntry {
  id: string;
  fecha: Date;
  concepto: string;
  tipo: "ENTRADA" | "SALIDA";
  valor: number;
  origen: string;
  referencia: string;
}

export interface FlujoCajaIndicadores {
  entradasEsperadas: number;
  salidasEsperadas: number;
  saldoProyectado: number;
  cajaNetaProyectada: number;
}

export interface Alerta {
  tipo: "DEFICIT" | "VENCIMIENTO_PROXIMO" | "CONCENTRACION";
  mensaje: string;
  nivel: "info" | "warning" | "critical";
  valor?: number;
}

export interface FlujoCajaData {
  entries: FlujoCajaEntry[];
  indicadores: FlujoCajaIndicadores;
  alertas: Alerta[];
}

function getPeriodRange(periodo: Periodo): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  switch (periodo) {
    case "semana":
      end.setDate(end.getDate() + 7);
      break;
    case "mes":
      end.setMonth(end.getMonth() + 1);
      break;
    case "trimestre":
      end.setMonth(end.getMonth() + 3);
      break;
    case "anio":
      end.setFullYear(end.getFullYear() + 1);
      break;
  }

  return { start, end };
}

export async function getFlujoCajaProyectado(periodo: Periodo = "mes"): Promise<FlujoCajaData> {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const { start, end } = getPeriodRange(periodo);
  const empresaId = session.user.empresaId;

  const [cuentasCobrar, cuentasPagar] = await Promise.all([
    prisma.cuentaCobrar.findMany({
      where: {
        empresaId,
        estado: { not: "PAGADO" },
        fechaVencimiento: { gte: start, lte: end },
      },
      include: {
        cliente: { select: { nombre: true } },
        contrato: { select: { codigo: true } },
        cobros: { select: { monto: true, fechaPago: true, metodoPago: true, referencia: true } },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.cuentaPagar.findMany({
      where: {
        empresaId,
        estado: { not: "PAGADO" },
        fechaVencimiento: { gte: start, lte: end },
      },
      include: {
        tercero: { select: { nombre: true } },
        pagos: { select: { monto: true, fechaPago: true, metodoPago: true, referencia: true } },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),
  ]);

  const allCxC = await prisma.cuentaCobrar.findMany({
    where: { empresaId, estado: { not: "PAGADO" } },
    include: { cliente: { select: { nombre: true } } },
  });

  const entries: FlujoCajaEntry[] = [];
  let totalEntradas = 0;
  let totalSalidas = 0;

  for (const cxc of cuentasCobrar) {
    const saldo = Number(cxc.saldoPendiente);
    if (saldo <= 0) continue;
    totalEntradas += saldo;
    entries.push({
      id: `cxc-${cxc.id}`,
      fecha: cxc.fechaVencimiento,
      concepto: `${cxc.cliente.nombre}${cxc.facturaId ? ` - Factura ${cxc.facturaId}` : ""}`,
      tipo: "ENTRADA",
      valor: saldo,
      origen: "Cuenta por Cobrar",
      referencia: cxc.contrato.codigo,
    });
  }

  for (const cxp of cuentasPagar) {
    const saldo = Number(cxp.saldoPendiente);
    if (saldo <= 0) continue;
    totalSalidas += saldo;
    entries.push({
      id: `cxp-${cxp.id}`,
      fecha: cxp.fechaVencimiento,
      concepto: cxp.tercero.nombre,
      tipo: "SALIDA",
      valor: saldo,
      origen: "Cuenta por Pagar",
      referencia: "",
    });
  }

  // Recurring contract projected income
  const contratosRecurrentes = await prisma.contrato.findMany({
    where: {
      empresaId,
      active: true,
      tipoContrato: { in: ["RECURRENTE", "MIXTO"] },
      valorRecurrente: { not: null, gt: 0 },
    },
    select: {
      id: true,
      codigo: true,
      nombre: true,
      cliente: { select: { nombre: true } },
      valorRecurrente: true,
      periodicidad: true,
      diaCorte: true,
      fechaInicio: true,
    },
  });

  const hoy = new Date();
  const inicioProyeccion = new Date(Math.max(start.getTime(), hoy.getTime()));

  for (const c of contratosRecurrentes) {
    const valor = Number(c.valorRecurrente);
    if (valor <= 0) continue;

    const diaCorte = c.diaCorte ?? 1;
    const fechasPago = generarFechasRecurrencia(inicioProyeccion, end, c.periodicidad as string, diaCorte, c.fechaInicio);

    let index = 0;
    for (const fecha of fechasPago) {
      index++;
      totalEntradas += valor;
      entries.push({
        id: `recurrente-${c.id}-${index}`,
        fecha,
        concepto: `${c.cliente.nombre} - ${c.nombre}`,
        tipo: "ENTRADA",
        valor,
        origen: "Ingreso Recurrente",
        referencia: c.codigo,
      });
    }
  }

  entries.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  const cajaNeta = totalEntradas - totalSalidas;

  const indicadores: FlujoCajaIndicadores = {
    entradasEsperadas: totalEntradas,
    salidasEsperadas: totalSalidas,
    saldoProyectado: totalEntradas - totalSalidas,
    cajaNetaProyectada: cajaNeta,
  };

  const alertas: Alerta[] = [];

  if (cajaNeta < 0) {
    alertas.push({
      tipo: "DEFICIT",
      mensaje: `Déficit proyectado de ${formatNumber(Math.abs(cajaNeta))} en el período`,
      nivel: "critical",
      valor: Math.abs(cajaNeta),
    });
  }

  const ahora = new Date();
  const sieteDias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
  const vencimientosProximos = entries.filter(
    (e) => e.fecha >= ahora && e.fecha <= sieteDias && e.tipo === "ENTRADA"
  );
  if (vencimientosProximos.length > 0) {
    const totalProximo = vencimientosProximos.reduce((s, e) => s + e.valor, 0);
    alertas.push({
      tipo: "VENCIMIENTO_PROXIMO",
      mensaje: `${vencimientosProximos.length} vencimiento(s) próximo(s) por ${formatNumber(totalProximo)} en los próximos 7 días`,
      nivel: "warning",
      valor: totalProximo,
    });
  }

  const pagosProximos = entries.filter(
    (e) => e.fecha >= ahora && e.fecha <= sieteDias && e.tipo === "SALIDA"
  );
  if (pagosProximos.length > 0) {
    const totalProximo = pagosProximos.reduce((s, e) => s + e.valor, 0);
    alertas.push({
      tipo: "VENCIMIENTO_PROXIMO",
      mensaje: `${pagosProximos.length} pago(s) próximo(s) por ${formatNumber(totalProximo)} en los próximos 7 días`,
      nivel: "info",
      valor: totalProximo,
    });
  }

  if (allCxC.length > 1) {
    const totalCartera = allCxC.reduce((s, c) => s + Number(c.saldoPendiente), 0);
    const maxCliente = allCxC.reduce(
      (max, c) => (Number(c.saldoPendiente) > Number(max.saldoPendiente) ? c : max),
      allCxC[0]
    );
    const porcentaje = totalCartera > 0 ? (Number(maxCliente.saldoPendiente) / totalCartera) * 100 : 0;
    if (porcentaje > 50) {
      alertas.push({
        tipo: "CONCENTRACION",
        mensaje: `Alta concentración en ${maxCliente.cliente.nombre}: ${porcentaje.toFixed(0)}% de la cartera`,
        nivel: "warning",
        valor: porcentaje,
      });
    }
  }

  return { entries, indicadores, alertas };
}

function generarFechasRecurrencia(desde: Date, hasta: Date, periodicidad: string, diaCorte: number, fechaInicio: Date): Date[] {
  const fechas: Date[] = [];
  const primerCobro = new Date(Math.max(desde.getTime(), fechaInicio.getTime()));
  const current = new Date(primerCobro);

  while (current <= hasta) {
    let fechaPago: Date;

    switch (periodicidad) {
      case "DIARIO":
        fechaPago = new Date(current);
        current.setDate(current.getDate() + 1);
        break;
      case "SEMANAL":
        fechaPago = new Date(current);
        // Set to the day of week matching diaCorte (1=Mon...7=Sun)
        const diaSemana = Math.min(Math.max(diaCorte, 1), 7);
        const diff = diaSemana - current.getDay();
        fechaPago.setDate(current.getDate() + diff);
        current.setDate(current.getDate() + 7);
        break;
      case "QUINCENAL":
        // Two payments per month: 1st and 15th (or diaCorte and diaCorte+15)
        fechaPago = new Date(current.getFullYear(), current.getMonth(), Math.min(diaCorte, 28));
        if (fechaPago < primerCobro) {
          fechaPago = new Date(current.getFullYear(), current.getMonth(), Math.min(diaCorte + 15, 28));
        }
        current.setMonth(current.getMonth() + 1);
        break;
      case "MENSUAL":
      default:
        fechaPago = new Date(current.getFullYear(), current.getMonth(), Math.min(diaCorte, 28));
        current.setMonth(current.getMonth() + 1);
        break;
    }

    if (fechaPago >= desde && fechaPago <= hasta) {
      fechas.push(fechaPago);
    }
  }

  return fechas;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}
