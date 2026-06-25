import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getFlujoCajaProyectado } from "@/features/financiero/flujo-caja";
import { getIndicadoresFinancieros } from "@/features/financiero/indicadores";
import { getAlertasFlota } from "@/features/vehiculos/server/queries";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const empresaId = session.user.empresaId;
  const ahora = new Date();

  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const finHoy = new Date(inicioHoy.getTime() + 86400000 - 1);

  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

  const inicioAnio = new Date(ahora.getFullYear(), 0, 1);
  const finAnio = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);

  const inicioAnioAnterior = new Date(ahora.getFullYear() - 1, 0, 1);
  const finAnioAnterior = new Date(ahora.getFullYear() - 1, 11, 31, 23, 59, 59);

  const [
    serviciosHoy,
    serviciosMes,
    serviciosMesAnterior,
    serviciosAnio,
    serviciosAnioAnterior,
    serviciosSinAsignar,
    porCobrarAgg,
    porPagarAgg,
    flujoCaja,
    indicadores,
    alertasFlota,
  ] = await Promise.all([
    prisma.servicio.findMany({
      where: { empresaId, fecha: { gte: inicioHoy, lte: finHoy } },
      select: { estado: true },
    }),
    prisma.servicio.findMany({
      where: { empresaId, fecha: { gte: inicioMes, lte: finMes }, estado: { not: "CANCELADO" } },
      include: { costos: { select: { total: true } } },
    }),
    prisma.servicio.findMany({
      where: { empresaId, fecha: { gte: inicioMesAnterior, lte: finMesAnterior }, estado: { not: "CANCELADO" } },
      include: { costos: { select: { total: true } } },
    }),
    prisma.servicio.findMany({
      where: { empresaId, fecha: { gte: inicioAnio, lte: finAnio }, estado: { not: "CANCELADO" } },
      include: { costos: { select: { total: true } } },
    }),
    prisma.servicio.findMany({
      where: { empresaId, fecha: { gte: inicioAnioAnterior, lte: finAnioAnterior }, estado: { not: "CANCELADO" } },
      include: { costos: { select: { total: true } } },
    }),
    prisma.servicio.findMany({
      where: {
        empresaId,
        estado: { not: "CANCELADO" },
        fecha: { gte: inicioHoy },
      },
      select: { vehiculoId: true, conductorId: true },
    }),
    prisma.cuentaCobrar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    prisma.cuentaPagar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    getFlujoCajaProyectado("mes"),
    getIndicadoresFinancieros(),
    getAlertasFlota(empresaId),
  ]);

  function ganancia(servicios: { ingresoReal?: unknown; ingresoEsperado: unknown; costos: { total: unknown }[] }[]) {
    return servicios.reduce((sum, s) => {
      const ingreso = Number(s.ingresoReal ?? s.ingresoEsperado);
      const costos = s.costos.reduce((c, co) => c + Number(co.total), 0);
      return sum + ingreso - costos;
    }, 0);
  }

  function ingresos(servicios: { ingresoReal?: unknown; ingresoEsperado: unknown }[]) {
    return servicios.reduce((sum, s) => sum + Number(s.ingresoReal ?? s.ingresoEsperado), 0);
  }

  function calcCambio(actual: number, anterior: number): number | null {
    if (anterior === 0) return null;
    return ((actual - anterior) / Math.abs(anterior)) * 100;
  }

  const gananciaProyectada = ganancia(serviciosMes);
  const gananciaMesAnterior = ganancia(serviciosMesAnterior);

  return {
    bloque1: {
      total: serviciosHoy.length,
      programados: serviciosHoy.filter((s) => s.estado === "PROGRAMADO").length,
      enCurso: serviciosHoy.filter((s) => s.estado === "EN_CURSO").length,
      completados: serviciosHoy.filter((s) => s.estado === "COMPLETADO").length,
      cancelados: serviciosHoy.filter((s) => s.estado === "CANCELADO").length,
    },
    bloque2: {
      ingresos: ingresos(serviciosMes),
      porCobrar: Number(porCobrarAgg._sum?.saldoPendiente ?? 0),
      porPagar: Number(porPagarAgg._sum?.saldoPendiente ?? 0),
      cajaProyectada: flujoCaja.indicadores.cajaNetaProyectada,
      gananciaProyectada,
      gananciaMesAnterior,
      porcentajeCambio: calcCambio(gananciaProyectada, gananciaMesAnterior),
    },
    bloque3: {
      ingresos: ingresos(serviciosAnio),
      ganancia: ganancia(serviciosAnio),
      ingresosAnioAnterior: ingresos(serviciosAnioAnterior),
      gananciaAnioAnterior: ganancia(serviciosAnioAnterior),
      porcentajeCambioIngresos: calcCambio(ingresos(serviciosAnio), ingresos(serviciosAnioAnterior)),
      porcentajeCambioGanancia: calcCambio(ganancia(serviciosAnio), ganancia(serviciosAnioAnterior)),
    },
    bloque4: {
      serviciosSinVehiculo: serviciosSinAsignar.filter((s) => !s.vehiculoId).length,
      serviciosSinConductor: serviciosSinAsignar.filter((s) => !s.conductorId).length,
      carteraVencida: indicadores.carteraVencida,
      alertasFlota,
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
