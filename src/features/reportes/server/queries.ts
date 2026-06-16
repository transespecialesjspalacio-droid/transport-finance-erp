import { prisma } from "@/lib/prisma";

export interface ReporteServicio {
  id: string; codigo: string | null; fecha: Date; contrato: string; cliente: string;
  vehiculo: string | null; conductor: string | null; origen: string | null; destino: string | null;
  ingresoEsperado: number; ingresoReal: number | null; costos: number; estado: string;
}

export async function getReporteServicios(empresaId: string, desde: Date, hasta: Date): Promise<ReporteServicio[]> {
  const servicios = await prisma.servicio.findMany({
    where: { empresaId, fecha: { gte: desde, lte: hasta }, estado: { not: "CANCELADO" } },
    include: {
      contrato: { select: { nombre: true, cliente: { select: { nombre: true } } } },
      vehiculo: { select: { placa: true } },
      conductor: { select: { nombre: true } },
      costos: { select: { total: true } },
    },
    orderBy: { fecha: "desc" },
  });
  return servicios.map(s => ({
    id: s.id, codigo: s.codigo, fecha: s.fecha, contrato: s.contrato.nombre,
    cliente: s.contrato.cliente.nombre, vehiculo: s.vehiculo?.placa ?? null,
    conductor: s.conductor?.nombre ?? null, origen: s.origen, destino: s.destino,
    ingresoEsperado: Number(s.ingresoEsperado), ingresoReal: s.ingresoReal ? Number(s.ingresoReal) : null,
    costos: s.costos.reduce((sum, c) => sum + Number(c.total), 0), estado: s.estado,
  }));
}

export async function getReporteClientes(empresaId: string) {
  const clientes = await prisma.cliente.findMany({
    where: { empresaId, active: true },
    include: {
      contratos: { where: { active: true }, select: { id: true, nombre: true } },
      cuentasCobrar: { where: { estado: { not: "PAGADO" } }, select: { saldoPendiente: true } },
    },
    orderBy: { nombre: "asc" },
  });
  return clientes.map(c => ({
    id: c.id, nombre: c.nombre, rfc: c.rfc, contratos: c.contratos.length,
    saldoPendiente: c.cuentasCobrar.reduce((s, cc) => s + Number(cc.saldoPendiente), 0),
  }));
}

export async function getReporteContratos(empresaId: string) {
  const contratos = await prisma.contrato.findMany({
    where: { empresaId, active: true },
    include: {
      cliente: { select: { nombre: true } },
      servicios: {
        where: { estado: { not: "CANCELADO" } },
        select: { id: true, ingresoEsperado: true, ingresoReal: true },
      },
    },
    orderBy: { nombre: "asc" },
  });
  return contratos.map(c => ({
    id: c.id, nombre: c.nombre, cliente: c.cliente.nombre, codigo: c.codigo,
    tipoServicio: c.tipoServicio, tipoContrato: c.tipoContrato,
    servicios: c.servicios.length,
    ingresos: c.servicios.reduce((s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado), 0),
  }));
}

export async function getReporteCuentasCobrar(empresaId: string) {
  const cuentas = await prisma.cuentaCobrar.findMany({
    where: { empresaId },
    include: { cliente: { select: { nombre: true } }, contrato: { select: { nombre: true } } },
    orderBy: { fechaVencimiento: "desc" },
  });
  return cuentas.map(c => ({
    id: c.id, facturaId: c.facturaId, cliente: c.cliente.nombre, contrato: c.contrato.nombre,
    montoTotal: Number(c.montoTotal), saldoPendiente: Number(c.saldoPendiente),
    fechaEmision: c.fechaEmision, fechaVencimiento: c.fechaVencimiento, estado: c.estado,
  }));
}

export async function getReporteCuentasPagar(empresaId: string) {
  const cuentas = await prisma.cuentaPagar.findMany({
    where: { empresaId },
    include: { tercero: { select: { nombre: true } } },
    orderBy: { fechaVencimiento: "desc" },
  });
  return cuentas.map(c => ({
    id: c.id, numero: c.numero, tercero: c.tercero.nombre,
    montoTotal: Number(c.montoTotal), saldoPendiente: Number(c.saldoPendiente),
    fechaEmision: c.fechaEmision, fechaVencimiento: c.fechaVencimiento, estado: c.estado,
  }));
}

export async function getReporteRentabilidad(empresaId: string, desde: Date, hasta: Date) {
  const servicios = await prisma.servicio.findMany({
    where: { empresaId, fecha: { gte: desde, lte: hasta }, estado: "COMPLETADO" },
    include: {
      contrato: { select: { nombre: true, cliente: { select: { nombre: true } } } },
      costos: { select: { total: true } },
    },
    orderBy: { fecha: "desc" },
  });
  const totalIngresos = servicios.reduce((s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado), 0);
  const totalCostos = servicios.reduce((s, sv) => s + sv.costos.reduce((c, co) => c + Number(co.total), 0), 0);
  return {
    servicios: servicios.map(sv => {
      const ingreso = Number(sv.ingresoReal ?? sv.ingresoEsperado);
      const costos = sv.costos.reduce((c, co) => c + Number(co.total), 0);
      return {
        id: sv.id, fecha: sv.fecha, contrato: sv.contrato.nombre, cliente: sv.contrato.cliente.nombre,
        ingreso, costos, utilidad: ingreso - costos,
        margen: ingreso > 0 ? ((ingreso - costos) / ingreso) * 100 : 0,
      };
    }),
    totales: { ingresos: totalIngresos, costos: totalCostos, utilidad: totalIngresos - totalCostos },
  };
}

export interface ComparativoRealVsProyectado {
  contratoId: string;
  contrato: string;
  cliente: string;
  utilidadReal: number;
  utilidadProyectada: number;
  diferencia: number;
  cumplimiento: number;
}

export async function getReporteComparativoRealVsProyectado(empresaId: string): Promise<ComparativoRealVsProyectado[]> {
  const contratos = await prisma.contrato.findMany({
    where: { empresaId, active: true },
    include: {
      cliente: { select: { nombre: true } },
      servicios: {
        where: { estado: { not: "CANCELADO" } },
        include: { costos: { select: { total: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  });

  return contratos.map((c) => {
    const proyectada = c.servicios.reduce((sum, sv) => {
      const ingreso = Number(sv.ingresoReal ?? sv.ingresoEsperado);
      const costos = sv.costos.reduce((c2, co) => c2 + Number(co.total), 0);
      return sum + ingreso - costos;
    }, 0);

    const real = c.servicios
      .filter((sv) => sv.estado === "COMPLETADO")
      .reduce((sum, sv) => {
        const ingreso = Number(sv.ingresoReal ?? sv.ingresoEsperado);
        const costos = sv.costos.reduce((c2, co) => c2 + Number(co.total), 0);
        return sum + ingreso - costos;
      }, 0);

    return {
      contratoId: c.id,
      contrato: c.nombre,
      cliente: c.cliente.nombre,
      utilidadReal: real,
      utilidadProyectada: proyectada,
      diferencia: proyectada - real,
      cumplimiento: proyectada > 0 ? (real / proyectada) * 100 : 0,
    };
  });
}

export interface RentabilidadContrato {
  id: string;
  contrato: string;
  cliente: string;
  tipoContrato: string;
  ingresosRecurrentes: number;
  ingresosServicios: number;
  costos: number;
  utilidad: number;
  margen: number;
}

export async function getReporteRentabilidadContratos(empresaId: string): Promise<RentabilidadContrato[]> {
  const contratos = await prisma.contrato.findMany({
    where: { empresaId, active: true },
    include: {
      cliente: { select: { nombre: true } },
      servicios: {
        where: { estado: { not: "CANCELADO" } },
        include: { costos: { select: { total: true } } },
      },
      costos: { select: { total: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return contratos
    .map((c) => {
      const ingresosRecurrentes =
        Number(c.valorRecurrente ?? 0) +
        (c.tipoContrato === "MIXTO" ? Number(c.rentabilidadBase ?? 0) : 0);
      const ingresosServicios = c.servicios.reduce(
        (s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado),
        0,
      );
      const costosServicios = c.servicios.reduce(
        (s, sv) => s + sv.costos.reduce((c2, co) => c2 + Number(co.total), 0),
        0,
      );
      const costosDirectos = c.costos.reduce((s, co) => s + Number(co.total), 0);
      const costos = costosServicios + costosDirectos;
      const utilidad = ingresosRecurrentes + ingresosServicios - costos;
      const totalIngresos = ingresosRecurrentes + ingresosServicios;
      return {
        id: c.id,
        contrato: c.nombre,
        cliente: c.cliente.nombre,
        tipoContrato: c.tipoContrato,
        ingresosRecurrentes,
        ingresosServicios,
        costos,
        utilidad,
        margen: totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0,
      };
    })
    .sort((a, b) => b.utilidad - a.utilidad);
}

export async function getReporteContratosRecurrentes(empresaId: string) {
  const contratos = await prisma.contrato.findMany({
    where: { empresaId, tipoContrato: { in: ["RECURRENTE", "MIXTO"] } },
    include: { cliente: { select: { nombre: true } } },
    orderBy: [{ active: "desc" }, { nombre: "asc" }],
  });
  return contratos.map(c => ({
    id: c.id, codigo: c.codigo, nombre: c.nombre, cliente: c.cliente.nombre,
    tipoContrato: c.tipoContrato, valorRecurrente: Number(c.valorRecurrente ?? 0),
    rentabilidadBase: Number(c.rentabilidadBase ?? 0),
    ingresoMensualTotal: Number(c.valorRecurrente ?? 0) + Number(c.rentabilidadBase ?? 0),
    active: c.active, fechaInicio: c.fechaInicio, fechaFin: c.fechaFin,
  }));
}
