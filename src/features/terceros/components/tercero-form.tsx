"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { terceroSchema, type TerceroFormData } from "../schemas/tercero-schema";
import { createTercero, updateTercero } from "../server/actions";
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
  defaultValues?: (TerceroFormData & { id?: string }) | undefined;
}

export function TerceroForm({ defaultValues }: Props) {
  const form = useForm<TerceroFormData>({
    resolver: zodResolver(terceroSchema),
    defaultValues: defaultValues ?? {
      nombre: "", rfc: "", tipoTercero: "OTRO", contacto: "",
    },
  });

  async function onSubmit(data: TerceroFormData) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""));
    try {
      if (defaultValues?.id) {
        await updateTercero(defaultValues.id, fd);
      } else {
        await createTercero(fd);
      }
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...form.register("nombre")} />
          {form.formState.errors.nombre && <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>}
        </div>
        {defaultValues?.codigo && (
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" value={defaultValues.codigo} readOnly />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input id="rfc" {...form.register("rfc")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoTercero">Tipo</Label>
          <Select onValueChange={(v) => form.setValue("tipoTercero", v as "TRANSPORTADOR" | "CONDUCTOR" | "COMBUSTIBLE" | "PEAJES" | "MANTENIMIENTO" | "OTRO")} defaultValue={defaultValues?.tipoTercero ?? "OTRO"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRANSPORTADOR">Transportador</SelectItem>
              <SelectItem value="CONDUCTOR">Conductor independiente</SelectItem>
              <SelectItem value="COMBUSTIBLE">Combustible</SelectItem>
              <SelectItem value="PEAJES">Peajes</SelectItem>
              <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="contacto">Contacto</Label>
          <Input id="contacto" {...form.register("contacto")} />
        </div>
      </div>
      <FormActions />
    </form>
  );
}
