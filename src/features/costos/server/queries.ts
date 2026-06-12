import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

const DEFAULT_TIPOS = [
  "Combustible",
  "Peajes",
  "Viáticos",
  "Alimentación",
  "Hospedaje",
  "Mantenimiento",
  "Parqueadero",
  "Otros",
];

export async function ensureDefaultTiposCosto(empresaId: string) {
  const existing = await prisma.tipoCosto.findFirst({
    where: { empresaId },
  });
  if (existing) return;

  await prisma.tipoCosto.createMany({
    data: DEFAULT_TIPOS.map((nombre) => ({
      empresaId,
      nombre,
      categoria: "VARIABLE" as const,
    })),
  });
}

export async function getCostos(params: { q?: string; page?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";

  const where = {
    empresaId: session.user.empresaId,
    ...(q && {
      descripcion: { contains: q, mode: "insensitive" as const },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.costoServicio.findMany({
      where,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { fecha: "desc" },
      include: {
        servicio: { select: { id: true, codigo: true, origen: true, destino: true } },
        tipoCosto: { select: { nombre: true } },
        tercero: { select: { nombre: true } },
      },
    }),
    prisma.costoServicio.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getCosto(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.costoServicio.findFirst({
    where: { id, empresaId: session.user.empresaId },
    include: {
      servicio: { select: { id: true, codigo: true, origen: true, destino: true } },
      tipoCosto: { select: { nombre: true } },
      tercero: { select: { nombre: true } },
    },
  });
}

export async function getServiciosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.servicio.findMany({
    where: { empresaId: session.user.empresaId, estado: { not: "CANCELADO" } },
    select: { id: true, codigo: true, origen: true, destino: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTiposCostoOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await ensureDefaultTiposCosto(session.user.empresaId);

  return prisma.tipoCosto.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getTercerosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.tercero.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}
