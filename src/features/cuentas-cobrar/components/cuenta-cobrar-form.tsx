"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cuentaCobrarSchema, type CuentaCobrarFormData } from "../schemas/cuenta-cobrar-schema";
import { createCuentaCobrar, updateCuentaCobrar } from "../server/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/shared/form-actions";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  defaultValues?: Record<string, unknown>;
  clientes: { id: string; nombre: string; codigo: string | null; rfc: string | null }[];
  contratos: { id: string; nombre: string; codigo: string }[];
  servicios: { id: string; fecha: Date; origen: string | null; destino: string | null }[];
}

export function CuentaCobrarForm({ defaultValues, clientes, contratos, servicios }: Props) {
  const form = useForm<CuentaCobrarFormData>({
    resolver: zodResolver(cuentaCobrarSchema),
    defaultValues: defaultValues ?? {
      clienteId: "", contratoId: "", servicioId: "", facturaId: "",
      montoTotal: "", fechaEmision: "", fechaVencimiento: "",
    },
  });

  async function onSubmit(data: CuentaCobrarFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
    try {
      const id = defaultValues?.id as string | undefined;
      if (id) {
        await updateCuentaCobrar(id, form);
      } else {
        await createCuentaCobrar(form);
      }
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clienteId">Cliente</Label>
          <Select onValueChange={(v) => form.setValue("clienteId", v)} defaultValue={defaultValues?.clienteId as string | undefined}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.clienteId && <p className="text-xs text-destructive">{form.formState.errors.clienteId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contratoId">Contrato</Label>
          <Select onValueChange={(v) => form.setValue("contratoId", v)} defaultValue={defaultValues?.contratoId as string | undefined}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {contratos.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.contratoId && <p className="text-xs text-destructive">{form.formState.errors.contratoId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicioId">Servicio (opcional)</Label>
          <Select onValueChange={(v) => form.setValue("servicioId", v)} defaultValue={defaultValues?.servicioId as string | undefined}>
            <SelectTrigger><SelectValue placeholder="Sin servicio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin servicio</SelectItem>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={s.id}>{new Date(s.fecha).toLocaleDateString()} — {s.origen ?? "?"} → {s.destino ?? "?"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="facturaId">Número de factura</Label>
          <Input id="facturaId" {...form.register("facturaId")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="montoTotal">Valor total</Label>
          <Input id="montoTotal" type="number" step="0.01" {...form.register("montoTotal")} />
          {form.formState.errors.montoTotal && <p className="text-xs text-destructive">{form.formState.errors.montoTotal.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaEmision">Fecha de emisión</Label>
          <Input id="fechaEmision" type="date" {...form.register("fechaEmision")} />
          {form.formState.errors.fechaEmision && <p className="text-xs text-destructive">{form.formState.errors.fechaEmision.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
          <Input id="fechaVencimiento" type="date" {...form.register("fechaVencimiento")} />
          {form.formState.errors.fechaVencimiento && <p className="text-xs text-destructive">{form.formState.errors.fechaVencimiento.message}</p>}
        </div>
      </div>
      <FormActions />
    </form>
  );
}
