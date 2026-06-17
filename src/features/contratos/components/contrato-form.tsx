"use client";

import { useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contratoSchema, type ContratoFormData } from "../schemas/contrato-schema";
import { createContrato, updateContrato } from "../server/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/shared/form-actions";
import { QuickCreateCliente } from "@/components/shared/quick-create-cliente";
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
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clientesList, setClientesList] = useState(clientes);

  const clienteMap = useMemo(() => {
    const map = new Map<string, { codigo: string | null; rfc: string | null }>();
    clientesList.forEach((c) => map.set(c.id, c));
    return map;
  }, [clientesList]);

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: defaultValues ?? {
      clienteId: "", codigo: "", nombre: "", tipoServicio: "ESCOLAR",
      tipoContrato: "POR_SERVICIOS", periodicidad: "", valorRecurrente: "",
      rentabilidadBase: "", diaCorte: "1",
      fechaInicio: "", fechaFin: "", montoMensual: "", condicionPago: "DIAS_30", notas: "",
    },
  });

  const tipoContrato = useWatch({ control: form.control, name: "tipoContrato" });
  const esRecurrente = tipoContrato === "RECURRENTE" || tipoContrato === "MIXTO";

  const handleClienteCreated = useCallback((cliente: { id: string; nombre: string; codigo: string | null; rfc: string | null }) => {
    setClientesList((prev) => [...prev, cliente]);
    form.setValue("clienteId", cliente.id);
    form.setValue("codigo", cliente.codigo ?? cliente.rfc ?? "");
  }, [form]);

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
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente</Label>
            <div className="flex gap-2">
              <div className="flex-1">
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
                    {clientesList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowClienteModal(true)}>
                Nuevo Cliente
              </Button>
            </div>
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
            <Label htmlFor="tipoContrato">Tipo de contrato</Label>
            <Select onValueChange={(v) => form.setValue("tipoContrato", v as "POR_SERVICIOS" | "RECURRENTE" | "MIXTO")} defaultValue={(defaultValues?.tipoContrato as string | undefined) ?? "POR_SERVICIOS"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="POR_SERVICIOS">Por servicios</SelectItem>
                <SelectItem value="RECURRENTE">Recurrente</SelectItem>
                <SelectItem value="MIXTO">Mixto</SelectItem>
              </SelectContent>
            </Select>
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

          {esRecurrente && (
            <>
              <div className="space-y-2">
                <Label htmlFor="periodicidad">Periodicidad</Label>
                <Select onValueChange={(v) => form.setValue("periodicidad", v)} defaultValue={(defaultValues?.periodicidad as string | undefined) ?? ""}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="DIARIO">Diario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorRecurrente">Valor recurrente</Label>
                <Input id="valorRecurrente" type="number" step="0.01" {...form.register("valorRecurrente")} />
              </div>
              {tipoContrato === "MIXTO" && (
                <div className="space-y-2">
                  <Label htmlFor="rentabilidadBase">Rentabilidad base (gestión)</Label>
                  <Input id="rentabilidadBase" type="number" step="0.01" {...form.register("rentabilidadBase")} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="diaCorte">Día de corte</Label>
                <Input id="diaCorte" type="number" min="1" max="28" {...form.register("diaCorte")} />
              </div>
            </>
          )}

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
            <Label htmlFor="montoMensual">Monto mensual (por servicios)</Label>
            <Input id="montoMensual" type="number" step="0.01" {...form.register("montoMensual")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notas">Notas</Label>
            <Input id="notas" {...form.register("notas")} />
          </div>
        </div>
        <FormActions />
      </form>
      <QuickCreateCliente open={showClienteModal} onOpenChange={setShowClienteModal} onClienteCreated={handleClienteCreated} />
    </>
  );
}
