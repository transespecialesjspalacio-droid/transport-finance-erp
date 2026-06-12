"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehiculoSchema, type VehiculoFormData } from "../schemas/vehiculo-schema";
import { createVehiculo, updateVehiculo } from "../server/actions";
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
  defaultValues?: VehiculoFormData & { id?: string };
}

export function VehiculoForm({ defaultValues }: Props) {
  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: defaultValues ?? {
      placa: "", marca: "", modelo: "", anio: "", capacidad: "",
      tipoVehiculo: "OTRO", propietario: "PROPIO", estado: "DISPONIBLE",
    },
  });

  async function onSubmit(data: VehiculoFormData) {
    const f = new FormData();
    Object.entries(data).forEach(([k, v]) => f.append(k, v === "__none__" ? "" : (v ?? "")));
    try {
      if (defaultValues?.id) {
        await updateVehiculo(defaultValues.id, f);
      } else {
        await createVehiculo(f);
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
          <Label htmlFor="placa">Placa</Label>
          <Input id="placa" {...form.register("placa")} />
          {form.formState.errors.placa && <p className="text-xs text-destructive">{form.formState.errors.placa.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" {...form.register("marca")} />
          {form.formState.errors.marca && <p className="text-xs text-destructive">{form.formState.errors.marca.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" {...form.register("modelo")} />
          {form.formState.errors.modelo && <p className="text-xs text-destructive">{form.formState.errors.modelo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="anio">Año</Label>
          <Input id="anio" type="number" {...form.register("anio")} />
          {form.formState.errors.anio && <p className="text-xs text-destructive">{form.formState.errors.anio.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacidad">Capacidad</Label>
          <Input id="capacidad" type="number" {...form.register("capacidad")} />
          {form.formState.errors.capacidad && <p className="text-xs text-destructive">{form.formState.errors.capacidad.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoVehiculo">Tipo de vehículo</Label>
          <Select onValueChange={(v) => form.setValue("tipoVehiculo", v as "CAMION" | "CAMIONETA" | "TRAILER" | "VOLQUETE" | "GRUA" | "OTRO")} defaultValue={defaultValues?.tipoVehiculo ?? "OTRO"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CAMION">Camión</SelectItem>
              <SelectItem value="CAMIONETA">Camioneta</SelectItem>
              <SelectItem value="TRAILER">Tráiler</SelectItem>
              <SelectItem value="VOLQUETE">Volquete</SelectItem>
              <SelectItem value="GRUA">Grúa</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="propietario">Propietario</Label>
          <Select onValueChange={(v) => form.setValue("propietario", v as "PROPIO" | "TERCERO")} defaultValue={defaultValues?.propietario ?? "PROPIO"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PROPIO">Propio</SelectItem>
              <SelectItem value="TERCERO">Tercero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select onValueChange={(v) => form.setValue("estado", v as "DISPONIBLE" | "EN_SERVICIO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO")} defaultValue={defaultValues?.estado ?? "DISPONIBLE"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DISPONIBLE">Disponible</SelectItem>
              <SelectItem value="EN_SERVICIO">En servicio</SelectItem>
              <SelectItem value="EN_MANTENIMIENTO">En mantenimiento</SelectItem>
              <SelectItem value="FUERA_DE_SERVICIO">Fuera de servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <FormActions />
    </form>
  );
}
