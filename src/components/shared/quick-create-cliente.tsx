"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clienteSchema, type ClienteFormData } from "@/features/clientes/schemas/cliente-schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCreated: (cliente: { id: string; nombre: string; codigo: string | null; rfc: string | null }) => void;
}

export function QuickCreateCliente({ open, onOpenChange, onClienteCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre: "", rfc: "", contactoNombre: "", contactoEmail: "", contactoTelefono: "", direccion: "" },
  });

  async function onSubmit(data: ClienteFormData) {
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
      const res = await fetch("/api/clientes/quick-create", { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al crear cliente");
      }
      const cliente = await res.json();
      onClienteCreated(cliente);
      reset();
      onOpenChange(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registra un cliente rápidamente sin salir del formulario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qc-nombre">Nombre *</Label>
            <Input id="qc-nombre" {...register("nombre")} autoFocus />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-rfc">NIT / Documento</Label>
            <Input id="qc-rfc" {...register("rfc")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-telefono">Teléfono</Label>
            <Input id="qc-telefono" {...register("contactoTelefono")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-email">Correo</Label>
            <Input id="qc-email" type="email" {...register("contactoEmail")} />
            {errors.contactoEmail && <p className="text-xs text-destructive">{errors.contactoEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-direccion">Dirección</Label>
            <Input id="qc-direccion" {...register("direccion")} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
