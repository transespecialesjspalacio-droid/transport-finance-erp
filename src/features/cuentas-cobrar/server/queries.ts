import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ITEMS_PER_PAGE = 10;

function getEstadoConVencido(estado: string, saldoPendiente: number, fechaVencimiento: Date): string {
  if (saldoPendiente > 0 && estado !== "PAGADO") {
    if (new Date() > fechaVencimiento) return "VENCIDO";
  }
  return estado;
}

export async function getCuentasCobrar(params: { q?: string; page?: string; estado?: string }) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";
  const estado = params.estado?.trim() || "";

  const where: Record<string, unknown> = { empresaId: session.user.empresaId };

  if (q) {
    where.OR = [
      { facturaId: { contains: q, mode: "insensitive" as const } },
      { cliente: { nombre: { contains: q, mode: "insensitive" as const } } },
      { contrato: { nombre: { contains: q, mode: "insensitive" as const } } },
    ];
  }

  if (estado) where.estado = estado;

  const [data, total] = await Promise.all([
    prisma.cuentaCobrar.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        contrato: { select: { id: true, nombre: true, codigo: true } },
        servicio: { select: { id: true, fecha: true } },
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.cuentaCobrar.count({ where }),
  ]);

  const dataConVencido = data.map((item) => ({
    ...item,
    estado: getEstadoConVencido(item.estado, Number(item.saldoPendiente), item.fechaVencimiento),
  }));

  return { data: dataConVencido, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page };
}

export async function getCuentaCobrar(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const cuenta = await prisma.cuentaCobrar.findFirst({
    where: { id, empresaId: session.user.empresaId },
    include: {
      cliente: { select: { id: true, nombre: true } },
      contrato: { select: { id: true, nombre: true, codigo: true } },
      servicio: { select: { id: true, fecha: true, origen: true, destino: true } },
      cobros: { orderBy: { fechaPago: "desc" } },
    },
  });

  if (!cuenta) return null;

  return {
    ...cuenta,
    estado: getEstadoConVencido(cuenta.estado, Number(cuenta.saldoPendiente), cuenta.fechaVencimiento),
  };
}

export async function getClientesOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.cliente.findMany({
    where: { empresaId: session.user.empresaId, active: true },
    select: { id: true, nombre: true, codigo: true, rfc: true },
    orderBy: { nombre: "asc" },
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

export async function getNextFacturaConsecutivo() {
  const session = await auth();
  if (!session?.user?.empresaId) return 1;

  const rows: { facturaId: string | null }[] = await prisma.$queryRawUnsafe(
    `SELECT factura_id AS "facturaId" FROM "cuentas_cobrar"
     WHERE "empresa_id" = $1 AND factura_id IS NOT NULL
     ORDER BY factura_id DESC LIMIT 1`,
    session.user.empresaId
  );

  const latest = rows[0]?.facturaId;
  if (!latest) return 1;

  const match = latest.match(/FAC-(\d+)/);
  return match ? parseInt(match[1], 10) + 1 : 1;
}

export async function getServiciosOptions() {
  const session = await auth();
  if (!session?.user?.empresaId) return [];

  return prisma.servicio.findMany({
    where: { empresaId: session.user.empresaId },
    select: { id: true, fecha: true, origen: true, destino: true },
    orderBy: { fecha: "desc" },
    take: 100,
  });
}
