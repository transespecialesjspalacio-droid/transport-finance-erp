import type { Servicio, CostoServicio } from "@prisma/client";

export type ServicioWithCostos = Servicio & { costos: CostoServicio[] };

export function totalCostos(servicio: ServicioWithCostos): number {
  return servicio.costos.reduce((sum, c) => sum + Number(c.total), 0);
}

export function margenUtilidad(servicio: ServicioWithCostos): number | null {
  const ingreso = Number(servicio.ingresoReal ?? servicio.ingresoEsperado);
  if (ingreso === 0) return null;
  return ((ingreso - totalCostos(servicio)) / ingreso) * 100;
}
