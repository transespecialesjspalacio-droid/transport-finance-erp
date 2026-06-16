import { z } from "zod";

export const vehiculoSchema = z.object({
  placa: z.string().min(3, "Mínimo 3 caracteres").max(20),
  marca: z.string().min(1, "Requerido").max(60),
  modelo: z.string().min(1, "Requerido").max(60),
  anio: z.string().min(1, "Requerido"),
  capacidad: z.string().min(1, "Requerido"),
  tipoVehiculo: z.enum(["BUS", "BUSETON", "BUSETA"]),
  propietario: z.enum(["PROPIO", "TERCERO"]),
  estado: z.enum(["DISPONIBLE", "EN_SERVICIO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]),
  fechaVencimientoSOAT: z.string().nullable().optional(),
  fechaVencimientoTecnomecanica: z.string().nullable().optional(),
  fechaVencimientoPoliza: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
});

export type VehiculoFormData = z.infer<typeof vehiculoSchema>;
