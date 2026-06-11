"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cobroSchema, type CobroFormData } from "../schemas/cuenta-cobrar-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  cuentaCobrarId: string;
  action: (id: string, data: FormData) => Promise<void>;
}

export function CobroForm({ cuentaCobrarId, action }: Props) {
  const form = useForm<CobroFormData>({
    resolver: zodResolver(cobroSchema),
    defaultValues: { monto: "", fechaPago: new Date().toISOString().split("T")[0], metodoPago: "TRANSFERENCIA", referencia: "" },
  });

  async function onSubmit(data: CobroFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
    try {
      await action(cuentaCobrarId, form);
      form.set("monto", "");
      form.set("referencia", "");
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="monto">Monto</Label>
          <Input id="monto" type="number" step="0.01" {...form.register("monto")} />
          {form.formState.errors.monto && <p className="text-xs text-destructive">{form.formState.errors.monto.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaPago">Fecha de pago</Label>
          <Input id="fechaPago" type="date" {...form.register("fechaPago")} />
          {form.formState.errors.fechaPago && <p className="text-xs text-destructive">{form.formState.errors.fechaPago.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="metodoPago">Método</Label>
          <Select onValueChange={(v) => form.setValue("metodoPago", v as "TRANSFERENCIA" | "CHEQUE" | "EFECTIVO" | "TARJETA")} defaultValue="TRANSFERENCIA">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="EFECTIVO">Efectivo</SelectItem>
              <SelectItem value="TARJETA">Tarjeta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referencia">Referencia</Label>
          <Input id="referencia" {...form.register("referencia")} />
        </div>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Registrar cobro
      </Button>
    </form>
  );
}
