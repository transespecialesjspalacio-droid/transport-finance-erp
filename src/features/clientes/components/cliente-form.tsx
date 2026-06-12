"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, type ClienteFormData } from "../schemas/cliente-schema";
import { createCliente, updateCliente } from "../server/actions";
import { generateCodigo } from "@/lib/codigo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/shared/form-actions";

interface Props {
  defaultValues?: ClienteFormData & { id?: string };
  codigo?: string | null;
}

export function ClienteForm({ defaultValues, codigo }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues ?? {
      nombre: "", rfc: "", contactoNombre: "", contactoEmail: "", contactoTelefono: "", direccion: "",
    },
  });

  const nombre = useWatch({ control, name: "nombre" });
  const codigoPreview = useMemo(() => {
    if (!nombre || nombre.trim().length < 2) return "";
    return generateCodigo(nombre, 0).replace(/-0000-/, "-????-");
  }, [nombre]);

  async function onSubmit(data: ClienteFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
    try {
      if (defaultValues?.id) {
        await updateCliente(defaultValues.id, form);
      } else {
        await createCliente(form);
      }
    } catch (e: unknown) {
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
          {codigo && <p className="text-xs text-muted-foreground">Código: {codigo}</p>}
          {codigoPreview && !codigo && (
            <p className="text-xs text-muted-foreground">Código: {codigoPreview}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactoNombre">Contacto</Label>
          <Input id="contactoNombre" {...register("contactoNombre")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactoEmail">Email</Label>
          <Input id="contactoEmail" type="email" {...register("contactoEmail")} />
          {errors.contactoEmail && <p className="text-xs text-destructive">{errors.contactoEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactoTelefono">Teléfono</Label>
          <Input id="contactoTelefono" {...register("contactoTelefono")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" {...register("direccion")} />
        </div>
      </div>
      <FormActions />
    </form>
  );
}
