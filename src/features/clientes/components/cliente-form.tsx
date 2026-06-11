"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, type ClienteFormData } from "../schemas/cliente-schema";
import { createCliente, updateCliente } from "../server/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActions } from "@/components/shared/form-actions";

interface Props {
  defaultValues?: ClienteFormData & { id?: string };
}

export function ClienteForm({ defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: defaultValues ?? {
      nombre: "", rfc: "", contactoNombre: "", contactoEmail: "", contactoTelefono: "", direccion: "",
    },
  });

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
        </div>
        {defaultValues?.codigo && (
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" value={defaultValues.codigo} readOnly />
          </div>
        )}
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
