import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getFlujoCajaProyectado } from "@/features/financiero/flujo-caja";
import { getIndicadoresFinancieros } from "@/features/financiero/indicadores";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const empresaId = session.user.empresaId;
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
  const doceMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 11, 1);

  const [
    totalFacturadoMes,
    totalCobrado,
    totalPorCobrarAgg,
    totalPorPagarAgg,
    serviciosCompletados,
    serviciosHoy,
    serviciosDelMes,
    clientesActivos,
    contratosVigentes,
    flujoCaja,
    indicadores,
  ] = await Promise.all([
    prisma.servicio.aggregate({
      where: { empresaId, fecha: { gte: inicioMes, lte: finMes }, estado: { not: "CANCELADO" } },
      _sum: { ingresoEsperado: true },
    }),
    prisma.cobro.aggregate({
      where: { cuentaCobrar: { empresaId } },
      _sum: { monto: true },
    }),
    prisma.cuentaCobrar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    prisma.cuentaPagar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    prisma.servicio.findMany({
      where: { empresaId, estado: { not: "CANCELADO" } },
      include: {
        costos: { select: { total: true } },
        contrato: { select: { cliente: { select: { id: true, nombre: true } } } },
      },
    }),
    prisma.servicio.findMany({
      where: {
        empresaId,
        fecha: {
          gte: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()),
          lte: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59),
        },
      },
      select: { id: true, estado: true },
    }),
    prisma.servicio.count({
      where: { empresaId, fecha: { gte: inicioMes, lte: finMes }, estado: { not: "CANCELADO" } },
    }),
    prisma.cliente.count({ where: { empresaId, active: true } }),
    prisma.contrato.count({ where: { empresaId, active: true } }),
    getFlujoCajaProyectado("mes"),
    getIndicadoresFinancieros(),
  ]);

  const totalFacturado = Number(totalFacturadoMes._sum?.ingresoEsperado ?? 0);

  const serviciosHoyArray = serviciosHoy;
  const enCurso = serviciosHoyArray.filter((s) => s.estado === "EN_CURSO").length;
  const programados = serviciosHoyArray.filter((s) => s.estado === "PROGRAMADO").length;

  const utilidadTotal = serviciosCompletados.reduce((sum, s) => {
    const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
    const costos = s.costos.reduce((c, co) => c + Number(co.total), 0);
    return sum + ingreso - costos;
  }, 0);

  const margenes = serviciosCompletados
    .map((s) => {
      const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
      const costos = s.costos.reduce((c, co) => c + Number(co.total), 0);
      return ingreso > 0 ? (ingreso - costos) / ingreso : 0;
    })
    .filter((m) => m > 0);

  const margenPromedio = margenes.length > 0
    ? margenes.reduce((s, m) => s + m, 0) / margenes.length
    : 0;

  const utilidadPorCliente = new Map<string, { nombre: string; utilidad: number }>();
  const utilidadPorContrato = new Map<string, { nombre: string; cliente: string; utilidad: number; ingresos: number }>();
  const costoPorTercero = new Map<string, { nombre: string; costo: number }>();

  const servicios12Meses = await prisma.servicio.findMany({
    where: { empresaId, fecha: { gte: doceMesesAtras }, estado: { not: "CANCELADO" } },
    include: {
      costos: { include: { tercero: { select: { id: true, nombre: true } } } },
      contrato: { select: { id: true, nombre: true, cliente: { select: { id: true, nombre: true } } } },
    },
  });

  for (const s of servicios12Meses) {
    const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
    const costos = s.costos.reduce((c, co) => c + Number(co.total), 0);
    const utilidad = ingreso - costos;

    const cliente = s.contrato.cliente;
    const existing = utilidadPorCliente.get(cliente.id) ?? { nombre: cliente.nombre, utilidad: 0 };
    existing.utilidad += utilidad;
    utilidadPorCliente.set(cliente.id, existing);

    const contratoId = s.contrato.id;
    const existingC = utilidadPorContrato.get(contratoId) ?? { nombre: s.contrato.nombre, cliente: cliente.nombre, utilidad: 0, ingresos: 0 };
    existingC.utilidad += utilidad;
    existingC.ingresos += ingreso;
    utilidadPorContrato.set(contratoId, existingC);

    for (const co of s.costos) {
      if (co.tercero) {
        const existingT = costoPorTercero.get(co.tercero.id) ?? { nombre: co.tercero.nombre, costo: 0 };
        existingT.costo += Number(co.total);
        costoPorTercero.set(co.tercero.id, existingT);
      }
    }
  }

  const serviciosMensuales = await getIngresosCostosPorMes(empresaId, doceMesesAtras);

  return {
    kpis: {
      totalFacturado,
      totalCobrado: Number(totalCobrado._sum?.monto ?? 0),
      totalPorCobrar: Number(totalPorCobrarAgg._sum?.saldoPendiente ?? 0),
      totalPorPagar: Number(totalPorPagarAgg._sum?.saldoPendiente ?? 0),
      utilidadAcumulada: utilidadTotal,
      cajaProyectada: flujoCaja.indicadores.cajaNetaProyectada,
      margenPromedio,
      serviciosDelMes,
    },
    serviciosHoy: { total: serviciosHoyArray.length, enCurso, programados },
    clientesActivos,
    contratosVigentes,
    flujoCajaEntries: flujoCaja.entries,
    alertas: flujoCaja.alertas,
    carteraVencida: indicadores.carteraVencida,
    pagosVencidos: indicadores.pagosVencidos,
    contratosBajoMargen: Array.from(utilidadPorContrato.values()).filter((c) => {
      const margen = c.ingresos > 0 ? c.utilidad / c.ingresos : 0;
      return margen < 0.1 && margen > 0;
    }).length,
    charts: {
      ingresosCostosPorMes: serviciosMensuales,
      topClientes: Array.from(utilidadPorCliente.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.utilidad - a.utilidad)
        .slice(0, 10),
      topContratos: Array.from(utilidadPorContrato.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.utilidad - a.utilidad)
        .slice(0, 10),
      topTerceros: Array.from(costoPorTercero.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.costo - a.costo)
        .slice(0, 10),
    },
    resumen: {
      clienteMasRentable: Array.from(utilidadPorCliente.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.utilidad - a.utilidad)[0] ?? null,
      contratoMasRentable: Array.from(utilidadPorContrato.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.utilidad - a.utilidad)[0] ?? null,
      servicioMasRentable: await getServicioMasRentable(empresaId),
      terceroMayorCosto: Array.from(costoPorTercero.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.costo - a.costo)[0] ?? null,
    },
  };
}

async function getIngresosCostosPorMes(empresaId: string, desde: Date) {
  const servicios = await prisma.servicio.findMany({
    where: { empresaId, fecha: { gte: desde }, estado: { not: "CANCELADO" } },
    include: { costos: { select: { total: true } } },
  });

  const meses: Record<string, { mes: string; ingresos: number; costos: number; utilidad: number }> = {};

  for (const s of servicios) {
    const key = `${s.fecha.getFullYear()}-${String(s.fecha.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit" }).format(s.fecha);
    const entry = meses[key] ?? { mes: label, ingresos: 0, costos: 0, utilidad: 0 };
    const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
    const costo = s.costos.reduce((c, co) => c + Number(co.total), 0);
    entry.ingresos += ingreso;
    entry.costos += costo;
    entry.utilidad += ingreso - costo;
    meses[key] = entry;
  }

  return Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

async function getServicioMasRentable(empresaId: string) {
  const servicios = await prisma.servicio.findMany({
    where: { empresaId, estado: { not: "CANCELADO" } },
    include: {
      costos: { select: { total: true } },
      contrato: { select: { nombre: true, cliente: { select: { nombre: true } } } },
    },
    orderBy: { fecha: "desc" },
    take: 500,
  });

  let mejor: { id: string; nombre: string; contrato: string; cliente: string; utilidad: number } | null = null;

  for (const s of servicios) {
    const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
    const costos = s.costos.reduce((c, co) => c + Number(co.total), 0);
    const utilidad = ingreso - costos;
    if (!mejor || utilidad > mejor.utilidad) {
      mejor = {
        id: s.id,
        nombre: `${s.origen ?? ""} → ${s.destino ?? ""}`.trim() || s.id.slice(0, 8),
        contrato: s.contrato.nombre,
        cliente: s.contrato.cliente.nombre,
        utilidad,
      };
    }
  }

  return mejor;
}
