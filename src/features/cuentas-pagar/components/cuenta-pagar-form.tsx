"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cuentaPagarSchema, type CuentaPagarFormData } from "../schemas/cuenta-pagar-schema";
import { createCuentaPagar, updateCuentaPagar, getNextCuentaPagarNumero } from "../server/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/shared/form-actions";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  defaultValues?: Record<string, unknown>;
  terceros: { id: string; nombre: string; codigo: string | null }[];
  servicios: { id: string; fecha: Date; origen: string | null; destino: string | null }[];
}

export function CuentaPagarForm({ defaultValues, terceros, servicios }: Props) {
  const [numeroPreview, setNumeroPreview] = useState("");
  const form = useForm<CuentaPagarFormData>({
    resolver: zodResolver(cuentaPagarSchema),
    defaultValues: defaultValues ?? {
      terceroId: "", servicioId: "", montoTotal: "", fechaEmision: "", fechaVencimiento: "",
    },
  });

  useEffect(() => {
    if (defaultValues?.numero) {
      setNumeroPreview(defaultValues.numero as string);
    } else {
      getNextCuentaPagarNumero().then((n) => setNumeroPreview(`CXP-${String(n).padStart(6, "0")}`));
    }
  }, [defaultValues]);

  async function onSubmit(data: CuentaPagarFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v === "__none__" ? "" : (v ?? "")));
    try {
      const id = defaultValues?.id as string | undefined;
      if (id) {
        await updateCuentaPagar(id, form);
      } else {
        await createCuentaPagar(form);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" value={numeroPreview} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terceroId">Tercero</Label>
          <Select onValueChange={(v) => form.setValue("terceroId", v)} defaultValue={defaultValues?.terceroId as string | undefined}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {terceros.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.terceroId && <p className="text-xs text-destructive">{form.formState.errors.terceroId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicioId">Servicio (opcional)</Label>
          <Select onValueChange={(v) => form.setValue("servicioId", v)} defaultValue={defaultValues?.servicioId as string | undefined}>
            <SelectTrigger><SelectValue placeholder="Sin servicio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin servicio</SelectItem>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={s.id}>{new Date(s.fecha).toLocaleDateString()} — {s.origen ?? "?"} → {s.destino ?? "?"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
