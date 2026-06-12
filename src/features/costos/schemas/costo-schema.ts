import { z } from "zod";

export const costoSchema = z.object({
  servicioId: z.string().min(1, "Selecciona un servicio"),
  tipoCostoId: z.string().min(1, "Selecciona el tipo de costo"),
  terceroId: z.string().optional().or(z.literal("")),
  descripcion: z.string().min(1, "Ingresa una descripción").max(200),
  monto: z.string().min(1, "Ingresa el monto"),
  cantidad: z.string().optional().or(z.literal("")),
  fecha: z.string().min(1, "Selecciona una fecha"),
});

export type CostoFormData = z.infer<typeof costoSchema>;
