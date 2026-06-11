import type { Servicio, CostoServicio } from "@prisma/client";

export type ServicioWithCostos = Servicio & { costos: CostoServicio[] };

function totalCostos(servicio: ServicioWithCostos): number {
  return servicio.costos.reduce((sum, c) => sum + Number(c.total), 0);
}

export function costoPorKm(servicio: ServicioWithCostos): number | null {
  if (!servicio.kmRecorridos || Number(servicio.kmRecorridos) === 0) return null;
  return totalCostos(servicio) / Number(servicio.kmRecorridos);
}

export function utilidadPorKm(servicio: ServicioWithCostos): number | null {
  if (!servicio.kmRecorridos || Number(servicio.kmRecorridos) === 0) return null;
  const ingreso = Number(servicio.ingresoReal ?? servicio.ingresoEsperado);
  return (ingreso - totalCostos(servicio)) / Number(servicio.kmRecorridos);
}

export function margenUtilidad(servicio: ServicioWithCostos): number | null {
  const ingreso = Number(servicio.ingresoReal ?? servicio.ingresoEsperado);
  if (ingreso === 0) return null;
  return ((ingreso - totalCostos(servicio)) / ingreso) * 100;
}
