import { z } from "zod";

export const conductorSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120),
  documento: z.string().optional().or(z.literal("")),
  licencia: z.string().min(1, "Requerido").max(60),
  categoria: z.string().max(50).optional().or(z.literal("")),
  telefono: z.string().max(20).optional().or(z.literal("")),
  fechaVencimiento: z.string().optional().or(z.literal("")),
  estado: z.enum(["DISPONIBLE", "EN_SERVICIO", "DE_BAJA"]),
});

export type ConductorFormData = z.infer<typeof conductorSchema>;
