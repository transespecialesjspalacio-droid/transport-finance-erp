import { z } from "zod";

export const cuentaCobrarSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  contratoId: z.string().min(1, "Selecciona un contrato"),
  servicioId: z.string().optional().or(z.literal("")),
  facturaId: z.string().max(50).optional().or(z.literal("")),
  montoTotal: z.string().min(1, "Ingresa el monto total"),
  fechaEmision: z.string().min(1, "Ingresa la fecha de emisión"),
  fechaVencimiento: z.string().min(1, "Ingresa la fecha de vencimiento"),
});

export type CuentaCobrarFormData = z.infer<typeof cuentaCobrarSchema>;

export const cobroSchema = z.object({
  monto: z.string().min(1, "Ingresa el monto"),
  fechaPago: z.string().min(1, "Ingresa la fecha de pago"),
  metodoPago: z.string().min(1, "Selecciona el método de pago"),
  referencia: z.string().max(100).optional().or(z.literal("")),
});

export type CobroFormData = z.infer<typeof cobroSchema>;
