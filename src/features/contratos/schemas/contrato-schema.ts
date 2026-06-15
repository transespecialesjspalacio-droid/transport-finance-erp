import { z } from "zod";

export const contratoSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  codigo: z.string().optional().or(z.literal("")),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120),
  tipoServicio: z.enum(["ESCOLAR", "CORPORATIVO", "MEDICO", "EVENTO"]),
  tipoContrato: z.enum(["POR_SERVICIOS", "RECURRENTE", "MIXTO"]),
  periodicidad: z.string().optional().or(z.literal("")),
  valorRecurrente: z.string().optional().or(z.literal("")),
  rentabilidadBase: z.string().optional().or(z.literal("")),
  diaCorte: z.string().optional().or(z.literal("")),
  fechaInicio: z.string().min(1, "Selecciona una fecha"),
  fechaFin: z.string().optional().or(z.literal("")),
  montoMensual: z.string().optional().or(z.literal("")),
  condicionPago: z.enum(["DIAS_30", "DIAS_60", "ANTICIPADO"]),
  notas: z.string().max(500).optional().or(z.literal("")),
});

export type ContratoFormData = z.infer<typeof contratoSchema>;
