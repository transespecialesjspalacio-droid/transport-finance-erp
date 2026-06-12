"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contratoSchema, type ContratoFormData } from "../schemas/contrato-schema";
import { createContrato, updateContrato } from "../server/actions";
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
  defaultValues?: Record<string, unknown>;
  clientes: { id: string; nombre: string; codigo: string | null; rfc: string | null }[];
}

export function ContratoForm({ defaultValues, clientes }: Props) {
  const clienteMap = useMemo(() => {
    const map = new Map<string, { codigo: string | null; rfc: string | null }>();
    clientes.forEach((c) => map.set(c.id, c));
    return map;
  }, [clientes]);

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: defaultValues ?? {
      clienteId: "", codigo: "", nombre: "", tipoServicio: "ESCOLAR",
      fechaInicio: "", fechaFin: "", montoMensual: "", condicionPago: "DIAS_30", notas: "",
    },
  });

  async function onSubmit(data: ContratoFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
    try {
      const id = defaultValues?.id as string | undefined;
      if (id) {
        await updateContrato(id, form);
      } else {
        await createContrato(form);
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
          <Label htmlFor="clienteId">Cliente</Label>
          <Select
            onValueChange={(v) => {
              form.setValue("clienteId", v);
              const cliente = clienteMap.get(v);
              if (cliente) {
                form.setValue("codigo", cliente.codigo ?? cliente.rfc ?? "");
              }
            }}
            defaultValue={defaultValues?.clienteId as string | undefined}
          >
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
          <Label htmlFor="codigo">Código</Label>
          <Input id="codigo" {...form.register("codigo")} readOnly />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre del contrato</Label>
          <Input id="nombre" {...form.register("nombre")} />
          {form.formState.errors.nombre && <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoServicio">Tipo de servicio</Label>
              <Select onValueChange={(v) => form.setValue("tipoServicio", v as "ESCOLAR" | "CORPORATIVO" | "MEDICO" | "EVENTO")} defaultValue={(defaultValues?.tipoServicio as string | undefined) ?? "ESCOLAR"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ESCOLAR">Escolar</SelectItem>
              <SelectItem value="CORPORATIVO">Corporativo</SelectItem>
              <SelectItem value="MEDICO">Médico</SelectItem>
              <SelectItem value="EVENTO">Evento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condicionPago">Condición de pago</Label>
              <Select onValueChange={(v) => form.setValue("condicionPago", v as "DIAS_30" | "DIAS_60" | "ANTICIPADO")} defaultValue={(defaultValues?.condicionPago as string | undefined) ?? "DIAS_30"}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DIAS_30">30 días</SelectItem>
              <SelectItem value="DIAS_60">60 días</SelectItem>
              <SelectItem value="ANTICIPADO">Anticipado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaInicio">Fecha de inicio</Label>
          <Input id="fechaInicio" type="date" {...form.register("fechaInicio")} />
          {form.formState.errors.fechaInicio && <p className="text-xs text-destructive">{form.formState.errors.fechaInicio.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha de fin</Label>
          <Input id="fechaFin" type="date" {...form.register("fechaFin")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="montoMensual">Monto mensual</Label>
          <Input id="montoMensual" type="number" step="0.01" {...form.register("montoMensual")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <Input id="notas" {...form.register("notas")} />
        </div>
      </div>
      <FormActions />
    </form>
  );
}
