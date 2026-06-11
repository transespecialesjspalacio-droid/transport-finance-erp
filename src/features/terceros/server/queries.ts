import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

export async function getTerceros(params: { q?: string; page?: string; tipo?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";
  const tipo = params.tipo?.trim() || "";

  const where: Record<string, unknown> = { empresaId: session.user.empresaId };

  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" as const } },
      { contacto: { contains: q, mode: "insensitive" as const } },
    ];
  }

  if (tipo) where.tipoTercero = tipo;

  const [data, total] = await Promise.all([
    prisma.tercero.findMany({
      where,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tercero.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getTercero(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  return prisma.tercero.findFirst({
    where: { id, empresaId: session.user.empresaId },
  });
}
