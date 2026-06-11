import { z } from "zod";

export const terceroSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120),
  rfc: z.string().max(13).optional().or(z.literal("")),
  tipoTercero: z.enum(["TRANSPORTADOR", "CONDUCTOR", "COMBUSTIBLE", "PEAJES", "MANTENIMIENTO", "OTRO"]),
  contacto: z.string().max(80).optional().or(z.literal("")),
});

export type TerceroFormData = z.infer<typeof terceroSchema>;
