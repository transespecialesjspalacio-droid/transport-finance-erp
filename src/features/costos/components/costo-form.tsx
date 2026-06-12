"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { costoSchema, type CostoFormData } from "../schemas/costo-schema";
import { createCosto, updateCosto } from "../server/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/shared/form-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  defaultValues?: CostoFormData & { id?: string };
  servicios: { id: string; codigo: string | null; origen: string | null; destino: string | null }[];
  tiposCosto: { id: string; nombre: string }[];
  terceros: { id: string; nombre: string }[];
}

export function CostoForm({ defaultValues, servicios, tiposCosto, terceros }: Props) {
  const form = useForm<CostoFormData>({
    resolver: zodResolver(costoSchema),
    defaultValues: defaultValues ?? {
      servicioId: "", tipoCostoId: "", terceroId: "",
      descripcion: "", monto: "", cantidad: "1", fecha: "",
    },
  });

  async function onSubmit(data: CostoFormData) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v === "__none__" ? "" : (v ?? "")));
    try {
      if (defaultValues?.id) {
        await updateCosto(defaultValues.id, fd);
      } else {
        await createCosto(fd);
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
          <Label htmlFor="servicioId">Servicio</Label>
          <Select onValueChange={(v) => form.setValue("servicioId", v)} defaultValue={defaultValues?.servicioId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.codigo || s.id} — {s.origen || ""} → {s.destino || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.servicioId && <p className="text-xs text-destructive">{form.formState.errors.servicioId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoCostoId">Tipo de costo</Label>
          <Select onValueChange={(v) => form.setValue("tipoCostoId", v)} defaultValue={defaultValues?.tipoCostoId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {tiposCosto.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.tipoCostoId && <p className="text-xs text-destructive">{form.formState.errors.tipoCostoId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="terceroId">Proveedor</Label>
          <Select onValueChange={(v) => form.setValue("terceroId", v === "__none__" ? "" : v)} defaultValue={defaultValues?.terceroId || "__none__"}>
            <SelectTrigger><SelectValue placeholder="Sin proveedor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin proveedor</SelectItem>
              {terceros.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" {...form.register("descripcion")} />
          {form.formState.errors.descripcion && <p className="text-xs text-destructive">{form.formState.errors.descripcion.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="monto">Monto</Label>
          <Input id="monto" type="number" step="0.01" {...form.register("monto")} />
          {form.formState.errors.monto && <p className="text-xs text-destructive">{form.formState.errors.monto.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input id="cantidad" type="number" step="1" {...form.register("cantidad")} />
          {form.formState.errors.cantidad && <p className="text-xs text-destructive">{form.formState.errors.cantidad.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" type="date" {...form.register("fecha")} />
          {form.formState.errors.fecha && <p className="text-xs text-destructive">{form.formState.errors.fecha.message}</p>}
        </div>
      </div>
      <FormActions />
    </form>
  );
}
