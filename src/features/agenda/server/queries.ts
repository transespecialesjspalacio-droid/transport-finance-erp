import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOcupacionRango } from "../utils/ocupacion";

type Rango = "dia" | "semana" | "mes";

export async function getAgendaServicios(fecha: string, rango: Rango) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const base = new Date(fecha);
  let desde: Date, hasta: Date;
  if (rango === "dia") {
    desde = new Date(base);
    hasta = new Date(base);
  } else if (rango === "semana") {
    const dia = base.getDay();
    desde = new Date(base);
    desde.setDate(base.getDate() - dia);
    hasta = new Date(desde);
    hasta.setDate(desde.getDate() + 6);
  } else {
    desde = new Date(base.getFullYear(), base.getMonth(), 1);
    hasta = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  }
  desde.setHours(0, 0, 0, 0);
  hasta.setHours(23, 59, 59, 999);

  const serviciosRaw = await prisma.servicio.findMany({
    where: {
      empresaId: session.user.empresaId,
      fecha: { gte: desde, lte: hasta },
    },
    include: {
      contrato: { select: { nombre: true, codigo: true, cliente: { select: { nombre: true } } } },
      vehiculo: { select: { placa: true } },
      conductor: { select: { nombre: true } },
    },
    orderBy: [{ fecha: "asc" }, { horaSalida: "asc" }],
  });

  const servicios = serviciosRaw.map((s) => ({
    ...s,
    ocupacion: getOcupacionRango(s),
  }));

  const serviciosDelDia = servicios.filter(
    (s) => s.fecha.toDateString() === base.toDateString()
  );

  const totalPasajeros = servicios.reduce((acc, s) => acc + (s.pasajeros ?? 0), 0);
  const vehiculosOcupados = new Set(servicios.filter((s) => s.vehiculoId).map((s) => s.vehiculoId));

  return {
    servicios,
    serviciosHoy: serviciosDelDia.length,
    totalServicios: servicios.length,
    totalPasajeros,
    vehiculosOcupados: vehiculosOcupados.size,
    desde,
    hasta,
  };
}

export type AgendaServicios = Awaited<ReturnType<typeof getAgendaServicios>>;
