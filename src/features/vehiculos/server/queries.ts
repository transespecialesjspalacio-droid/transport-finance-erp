import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

export async function getVehiculos(params: { q?: string; page?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";

  const where: Record<string, unknown> = { empresaId: session.user.empresaId };

  if (q) {
    where.OR = [
      { placa: { contains: q, mode: "insensitive" as const } },
      { marca: { contains: q, mode: "insensitive" as const } },
      { modelo: { contains: q, mode: "insensitive" as const } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.vehiculo.findMany({
      where,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehiculo.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getVehiculo(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.vehiculo.findFirst({
    where: { id, empresaId: session.user.empresaId },
  });
}

export interface CostoPorCategoria {
  categoria: string;
  total: number;
}

export async function getVehiculoDetalle(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) return null;

  const vehiculo = await prisma.vehiculo.findFirst({
    where: { id, empresaId: session.user.empresaId },
    include: {
      costos: {
        include: {
          tipoCosto: { select: { nombre: true } },
          servicio: { select: { codigo: true } },
        },
        orderBy: { fecha: "desc" },
        take: 100,
      },
      servicios: {
        where: { estado: { not: "CANCELADO" } },
        include: {
          costos: {
            include: { tipoCosto: { select: { nombre: true } } },
          },
        },
        orderBy: { fecha: "desc" },
        take: 50,
      },
    },
  });
  if (!vehiculo) return null;

  // Group costs by category (from direct + service costs)
  const costosPorCategoria = new Map<string, number>();
  for (const c of vehiculo.costos) {
    const cat = c.tipoCosto.nombre;
    costosPorCategoria.set(cat, (costosPorCategoria.get(cat) ?? 0) + Number(c.total));
  }
  for (const sv of vehiculo.servicios) {
    for (const c of sv.costos) {
      const cat = c.tipoCosto.nombre;
      costosPorCategoria.set(cat, (costosPorCategoria.get(cat) ?? 0) + Number(c.total));
    }
  }

  const costosPorCategoriaArr = Array.from(costosPorCategoria.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  // Rentability
  const ingresos = vehiculo.servicios.reduce(
    (s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado), 0,
  );
  const costosServicios = vehiculo.servicios.reduce(
    (s, sv) => s + sv.costos.reduce((c2, co) => c2 + Number(co.total), 0), 0,
  );
  const costosDirectos = vehiculo.costos.reduce((s, c) => s + Number(c.total), 0);
  const costosTotales = costosServicios + costosDirectos;
  const utilidad = ingresos - costosTotales;

  return {
    ...vehiculo,
    rentabilidad: {
      ingresos,
      costos: costosTotales,
      utilidad,
      margen: ingresos > 0 ? (utilidad / ingresos) * 100 : 0,
      servicios: vehiculo.servicios.length,
    },
    costosPorCategoria: costosPorCategoriaArr,
  };
}

export type VehiculoDetalle = Awaited<ReturnType<typeof getVehiculoDetalle>>;

export interface RentabilidadVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ingresos: number;
  costos: number;
  utilidad: number;
  margen: number;
  servicios: number;
}

export async function getRentabilidadVehiculos(empresaId: string): Promise<RentabilidadVehiculo[]> {
  const vehiculos = await prisma.vehiculo.findMany({
    where: { empresaId, active: true },
    include: {
      servicios: {
        where: { estado: { not: "CANCELADO" } },
        include: { costos: { select: { total: true } } },
      },
      costos: { select: { total: true } },
    },
    orderBy: { placa: "asc" },
  });

  return vehiculos
    .map((v) => {
      const ingresos = v.servicios.reduce((s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado), 0);
      const costosServicios = v.servicios.reduce((s, sv) => s + sv.costos.reduce((c, co) => c + Number(co.total), 0), 0);
      const costosDirectos = v.costos.reduce((s, c) => s + Number(c.total), 0);
      const costos = costosServicios + costosDirectos;
      const utilidad = ingresos - costos;
      return {
        id: v.id,
        placa: v.placa,
        marca: v.marca ?? "",
        modelo: v.modelo ?? "",
        ingresos,
        costos,
        utilidad,
        margen: ingresos > 0 ? (utilidad / ingresos) * 100 : 0,
        servicios: v.servicios.length,
      };
    })
    .sort((a, b) => b.utilidad - a.utilidad);
}

export interface AlertaFlota {
  vehiculoId: string;
  placa: string;
  tipo: "SOAT" | "TECNOMECANICA" | "POLIZA";
  fechaVencimiento: Date;
  diasRestantes: number;
}

export async function getAlertasFlota(empresaId: string): Promise<AlertaFlota[]> {
  const vehiculos = await prisma.vehiculo.findMany({
    where: { empresaId, active: true },
    select: {
      id: true,
      placa: true,
      fechaVencimientoSOAT: true,
      fechaVencimientoTecnomecanica: true,
      fechaVencimientoPoliza: true,
    },
  });

  const alertas: AlertaFlota[] = [];

  for (const v of vehiculos) {
    for (const [tipo, fecha] of [
      ["SOAT", v.fechaVencimientoSOAT],
      ["TECNOMECANICA", v.fechaVencimientoTecnomecanica],
      ["POLIZA", v.fechaVencimientoPoliza],
    ] as const) {
      if (!fecha) continue;
      const dias = Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (dias <= 30) {
        alertas.push({
          vehiculoId: v.id,
          placa: v.placa,
          tipo: tipo as AlertaFlota["tipo"],
          fechaVencimiento: fecha,
          diasRestantes: dias,
        });
      }
    }
  }

  return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export async function getVehiculosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.vehiculo.findMany({
    where: { empresaId: session.user.empresaId, active: true, estado: "DISPONIBLE" },
    select: { id: true, placa: true, marca: true, modelo: true },
    orderBy: { placa: "asc" },
  });
}
