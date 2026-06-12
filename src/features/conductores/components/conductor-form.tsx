"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { conductorSchema, type ConductorFormData } from "../schemas/conductor-schema";
import { createConductor, updateConductor } from "../server/actions";
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
  defaultValues?: ConductorFormData & { id?: string };
}

export function ConductorForm({ defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: defaultValues ?? {
      nombre: "", documento: "", licencia: "", categoria: "",
      telefono: "", fechaVencimiento: "", estado: "DISPONIBLE",
    },
  });

  async function onSubmit(data: ConductorFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
    try {
      if (defaultValues?.id) {
        await updateConductor(defaultValues.id, form);
      } else {
        await createConductor(form);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="documento">Documento</Label>
          <Input id="documento" {...register("documento")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licencia">Licencia</Label>
          <Input id="licencia" {...register("licencia")} />
          {errors.licencia && <p className="text-xs text-destructive">{errors.licencia.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input id="categoria" {...register("categoria")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" {...register("telefono")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaVencimiento">Vencimiento de licencia</Label>
          <Input id="fechaVencimiento" type="date" {...register("fechaVencimiento")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            onValueChange={(v) => setValue("estado", v as "DISPONIBLE" | "EN_SERVICIO" | "DE_BAJA")}
            defaultValue={defaultValues?.estado ?? "DISPONIBLE"}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DISPONIBLE">Disponible</SelectItem>
              <SelectItem value="EN_SERVICIO">En servicio</SelectItem>
              <SelectItem value="DE_BAJA">De baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <FormActions />
    </form>
  );
}
