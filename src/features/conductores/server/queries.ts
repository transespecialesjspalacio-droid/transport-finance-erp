import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

export async function getConductores(params: { q?: string; page?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";

  const where = {
    empresaId: session.user.empresaId,
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: "insensitive" as const } },
        { licencia: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.conductor.findMany({
      where,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.conductor.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getConductor(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.conductor.findFirst({
    where: { id, empresaId: session.user.empresaId },
  });
}

export async function getConductoresOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.conductor.findMany({
    where: { empresaId: session.user.empresaId, active: true, estado: "DISPONIBLE" },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}
