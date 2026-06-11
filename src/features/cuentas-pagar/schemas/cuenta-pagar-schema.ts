import { z } from "zod";

export const cuentaPagarSchema = z.object({
  terceroId: z.string().min(1, "Selecciona un tercero"),
  servicioId: z.string().optional().or(z.literal("")),
  montoTotal: z.string().min(1, "Ingresa el monto total"),
  fechaEmision: z.string().min(1, "Ingresa la fecha de emisión"),
  fechaVencimiento: z.string().min(1, "Ingresa la fecha de vencimiento"),
});

export type CuentaPagarFormData = z.infer<typeof cuentaPagarSchema>;

export const pagoSchema = z.object({
  monto: z.string().min(1, "Ingresa el monto"),
  fechaPago: z.string().min(1, "Ingresa la fecha de pago"),
  metodoPago: z.string().min(1, "Selecciona el método de pago"),
  referencia: z.string().max(100).optional().or(z.literal("")),
});

export type PagoFormData = z.infer<typeof pagoSchema>;
