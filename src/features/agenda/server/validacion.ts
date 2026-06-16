import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface ConflictoVehiculo {
  tipo: "vehiculo";
  vehiculoId: string;
  placa: string;
  servicios: { id: string; codigo: string; fecha: Date; horaSalida?: Date | null; estado: string }[];
}

export interface ConflictoConductor {
  tipo: "conductor";
  conductorId: string;
  nombre: string;
  servicios: { id: string; codigo: string; fecha: Date; horaSalida?: Date | null; estado: string }[];
}

export interface OcupacionFlota {
  vehiculoId: string;
  placa: string;
  serviciosHoy: number;
  serviciosSemana: number;
}

export async function getConflictosAgenda(fecha: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const base = new Date(fecha);
  const inicioSemana = new Date(base);
  inicioSemana.setDate(base.getDate() - base.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  finSemana.setHours(23, 59, 59, 999);

  const servicios = await prisma.servicio.findMany({
    where: {
      empresaId: session.user.empresaId,
      fecha: { gte: inicioSemana, lte: finSemana },
      estado: { not: "CANCELADO" },
      vehiculoId: { not: null },
    },
    include: {
      vehiculo: { select: { placa: true } },
      conductor: { select: { nombre: true } },
    },
    orderBy: { fecha: "asc" },
  });

  const vehiculoMap = new Map<string, typeof servicios>();
  const conductorMap = new Map<string, typeof servicios>();
  for (const s of servicios) {
    if (s.vehiculoId) {
      if (!vehiculoMap.has(s.vehiculoId)) vehiculoMap.set(s.vehiculoId, []);
      vehiculoMap.get(s.vehiculoId)!.push(s);
    }
    if (s.conductorId) {
      if (!conductorMap.has(s.conductorId)) conductorMap.set(s.conductorId, []);
      conductorMap.get(s.conductorId)!.push(s);
    }
  }

  const conflictosVehiculo: ConflictoVehiculo[] = [];
  for (const [vid, ss] of vehiculoMap) {
    const fechas = ss.map((s) => s.fecha.toDateString());
    const unicas = new Set(fechas);
    if (unicas.size < fechas.length) {
      conflictosVehiculo.push({
        tipo: "vehiculo",
        vehiculoId: vid,
        placa: ss[0].vehiculo?.placa ?? "",
        servicios: ss.map((s) => ({
          id: s.id,
          codigo: s.codigo ?? "",
          fecha: s.fecha,
          horaSalida: s.horaSalida,
          estado: s.estado,
        })),
      });
    }
  }

  const conflictosConductor: ConflictoConductor[] = [];
  for (const [cid, ss] of conductorMap) {
    const fechas = ss.map((s) => s.fecha.toDateString());
    const unicas = new Set(fechas);
    if (unicas.size < fechas.length) {
      conflictosConductor.push({
        tipo: "conductor",
        conductorId: cid,
        nombre: ss[0].conductor?.nombre ?? "",
        servicios: ss.map((s) => ({
          id: s.id,
          codigo: s.codigo ?? "",
          fecha: s.fecha,
          horaSalida: s.horaSalida,
          estado: s.estado,
        })),
      });
    }
  }

  const vehiculosHoy = servicios.filter(
    (s) => s.fecha.toDateString() === base.toDateString()
  );
  const ocupacionMap = new Map<string, number>();
  for (const s of vehiculosHoy) {
    if (s.vehiculoId) ocupacionMap.set(s.vehiculoId, (ocupacionMap.get(s.vehiculoId) ?? 0) + 1);
  }
  const serviciosPorVehiculoSemana = new Map<string, number>();
  for (const s of servicios) {
    if (s.vehiculoId) serviciosPorVehiculoSemana.set(s.vehiculoId, (serviciosPorVehiculoSemana.get(s.vehiculoId) ?? 0) + 1);
  }

  const ocupacionFlota: OcupacionFlota[] = Array.from(ocupacionMap.entries()).map(([vid, count]) => ({
    vehiculoId: vid,
    placa: vehiculosHoy.find((s) => s.vehiculoId === vid)?.vehiculo?.placa ?? "",
    serviciosHoy: count,
    serviciosSemana: serviciosPorVehiculoSemana.get(vid) ?? 0,
  }));

  return { conflictosVehiculo, conflictosConductor, ocupacionFlota };
}

export type ConflictosAgenda = Awaited<ReturnType<typeof getConflictosAgenda>>;
