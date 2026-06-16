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
    },
    orderBy: { placa: "asc" },
  });

  return vehiculos.map((v) => {
    const ingresos = v.servicios.reduce((s, sv) => s + Number(sv.ingresoReal ?? sv.ingresoEsperado), 0);
    const costos = v.servicios.reduce((s, sv) => s + sv.costos.reduce((c, co) => c + Number(co.total), 0), 0);
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
  });
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
