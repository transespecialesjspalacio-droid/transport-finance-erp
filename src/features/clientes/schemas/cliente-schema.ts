import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120),
  rfc: z.string().optional().or(z.literal("")),
  contactoTipo: z.string().optional(),
  contactoNombre: z.string().max(80).optional().or(z.literal("")),
  contactoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  contactoTelefono: z.string().max(20).optional().or(z.literal("")),
  direccion: z.string().max(250).optional().or(z.literal("")),

});

export type ClienteFormData = z.infer<typeof clienteSchema>;
