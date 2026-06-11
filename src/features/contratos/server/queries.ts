import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

export async function getContratos(params: { q?: string; page?: string; tipo?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";
  const tipo = params.tipo?.trim() || "";

  const where: Record<string, unknown> = { empresaId: session.user.empresaId };

  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: "insensitive" as const } },
      { nombre: { contains: q, mode: "insensitive" as const } },
      { cliente: { nombre: { contains: q, mode: "insensitive" as const } } },
    ];
  }

  if (tipo) where.tipoServicio = tipo;

  const [data, total] = await Promise.all([
    prisma.contrato.findMany({
      where,
      include: { cliente: { select: { nombre: true } } },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contrato.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getContrato(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.contrato.findFirst({
    where: { id, empresaId: session.user.empresaId },
    include: { cliente: { select: { nombre: true, id: true } } },
  });
}

export async function getClientesOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.cliente.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}
