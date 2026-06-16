import { z } from "zod";

export const servicioSchema = z.object({
  codigo: z.string().optional().or(z.literal("")),
  contratoId: z.string().min(1, "Selecciona un contrato"),
  vehiculoId: z.string().optional().or(z.literal("")),
  conductorId: z.string().optional().or(z.literal("")),
  fecha: z.string().min(1, "Selecciona una fecha"),
  horaSalida: z.string().optional().or(z.literal("")),
  fechaRegreso: z.string().optional().or(z.literal("")),
  horaRegreso: z.string().optional().or(z.literal("")),
  horaInicio: z.string().optional().or(z.literal("")),
  horaFin: z.string().optional().or(z.literal("")),
  origen: z.string().max(200).optional().or(z.literal("")),
  destino: z.string().max(200).optional().or(z.literal("")),
  pasajeros: z.string().optional().or(z.literal("")),
  observacionesOperativas: z.string().optional().or(z.literal("")),
  tipoServicio: z.enum(["REGULAR", "EXTRA", "EVENTUAL"]),
  tarifaAplicada: z.string().min(1, "Ingresa la tarifa"),
  ingresoEsperado: z.string().optional().or(z.literal("")),
  ingresoReal: z.string().optional().or(z.literal("")),
  estado: z.enum(["PROGRAMADO", "EN_CURSO", "COMPLETADO", "CANCELADO"]),
  notas: z.string().max(500).optional().or(z.literal("")),
});

export type ServicioFormData = z.infer<typeof servicioSchema>;
