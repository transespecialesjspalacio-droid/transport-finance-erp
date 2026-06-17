import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

export async function getServicios(params: { q?: string; page?: string; estado?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";
  const estado = params.estado?.trim() || "";

  const where: Record<string, unknown> = { empresaId: session.user.empresaId };

  if (q) {
    where.OR = [
      { origen: { contains: q, mode: "insensitive" as const } },
      { destino: { contains: q, mode: "insensitive" as const } },
      { contrato: { nombre: { contains: q, mode: "insensitive" as const } } },
    ];
  }

  if (estado) where.estado = estado;

  const [data, total] = await Promise.all([
    prisma.servicio.findMany({
      where,
      include: {
        contrato: { select: { nombre: true, codigo: true } },
        vehiculo: { select: { placa: true } },
        conductor: { select: { nombre: true } },
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { fecha: "desc" },
    }),
    prisma.servicio.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getServicio(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.servicio.findFirst({
    where: { id, empresaId: session.user.empresaId },
    include: {
      contrato: { select: { nombre: true, codigo: true, id: true } },
      vehiculo: { select: { id: true, placa: true } },
      conductor: { select: { id: true, nombre: true } },
      costos: { include: { tipoCosto: true } },
      cuentasCobrar: { select: { id: true, facturaId: true, estado: true, saldoPendiente: true } },
      cuentasPagar: { select: { id: true, numero: true, estado: true, saldoPendiente: true } },
      tercero: { select: { id: true, nombre: true } },
    },
  });
}

export async function getContratosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.contrato.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true, codigo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getVehiculosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.vehiculo.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, placa: true, marca: true, modelo: true },
    orderBy: { placa: "asc" },
  });
}

export async function getConductoresOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.conductor.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getTercerosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.tercero.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}
