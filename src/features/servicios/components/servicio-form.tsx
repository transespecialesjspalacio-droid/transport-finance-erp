"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { servicioSchema, type ServicioFormData } from "../schemas/servicio-schema";
import { createServicio, updateServicio, getNextServicioCodigo } from "../server/actions";
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
  contratos: { id: string; nombre: string; codigo: string }[];
  vehiculos: { id: string; placa: string; marca: string; modelo: string }[];
  conductores: { id: string; nombre: string }[];
  terceros?: { id: string; nombre: string }[];
}

export function ServicioForm({ defaultValues, contratos, vehiculos, conductores, terceros = [] }: Props) {
  const [codigoPreview, setCodigoPreview] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);

  const form = useForm<ServicioFormData>({
    resolver: zodResolver(servicioSchema),
    defaultValues: defaultValues ?? {
      contratoId: "", vehiculoId: "", conductorId: "", fecha: "",
      horaInicio: "", horaFin: "", origen: "", destino: "",
      tipoServicio: "REGULAR",
      tarifaAplicada: "", ingresoEsperado: "", ingresoReal: "",
      estado: "PROGRAMADO", notas: "",
      realizadoPor: "PROPIO", terceroId: "", valorAPagar: "", fechaVencimientoPago: "",
    },
  });

  const realizadoPor = useWatch({ control: form.control, name: "realizadoPor" });

  useEffect(() => {
    if (defaultValues?.codigo) {
      setCodigoPreview(defaultValues.codigo as string);
    } else {
      getNextServicioCodigo().then((n) => setCodigoPreview(`SER-${String(n).padStart(6, "0")}`));
    }
  }, [defaultValues]);

  const handleClienteCreated = useCallback((_cliente: { id: string; nombre: string; codigo: string | null; rfc: string | null }) => {
    void _cliente;
  }, []);

  async function onSubmit(data: ServicioFormData) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v === "__none__" ? "" : (v ?? "")));
    try {
      const id = defaultValues?.id as string | undefined;
      if (id) {
        await updateServicio(id, form);
      } else {
        await createServicio(form);
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
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" value={codigoPreview} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contratoId">Contrato</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select onValueChange={(v) => form.setValue("contratoId", v)} defaultValue={defaultValues?.contratoId as string | undefined}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {contratos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowClienteModal(true)}>
                Nuevo Cliente
              </Button>
            </div>
            {form.formState.errors.contratoId && <p className="text-xs text-destructive">{form.formState.errors.contratoId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoServicio">Tipo</Label>
            <Select onValueChange={(v) => form.setValue("tipoServicio", v as "REGULAR" | "EXTRA" | "EVENTUAL")} defaultValue={(defaultValues?.tipoServicio as string | undefined) ?? "REGULAR"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="EXTRA">Extra</SelectItem>
                <SelectItem value="EVENTUAL">Eventual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" {...form.register("fecha")} />
            {form.formState.errors.fecha && <p className="text-xs text-destructive">{form.formState.errors.fecha.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select onValueChange={(v) => form.setValue("estado", v as "PROGRAMADO" | "EN_CURSO" | "COMPLETADO" | "CANCELADO")} defaultValue={(defaultValues?.estado as string | undefined) ?? "PROGRAMADO"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PROGRAMADO">Programado</SelectItem>
                <SelectItem value="EN_CURSO">En curso</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehiculoId">Vehículo</Label>
            <Select onValueChange={(v) => form.setValue("vehiculoId", v)} defaultValue={(defaultValues?.vehiculoId as string | undefined) ?? ""}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {vehiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="conductorId">Conductor</Label>
            <Select onValueChange={(v) => form.setValue("conductorId", v)} defaultValue={(defaultValues?.conductorId as string | undefined) ?? ""}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {conductores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="origen">Origen</Label>
            <Input id="origen" {...form.register("origen")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destino">Destino</Label>
            <Input id="destino" {...form.register("destino")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaSalida">Hora salida</Label>
            <Input id="horaSalida" type="time" {...form.register("horaSalida")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaRegreso">Fecha regreso</Label>
            <Input id="fechaRegreso" type="date" {...form.register("fechaRegreso")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaRegreso">Hora regreso</Label>
            <Input id="horaRegreso" type="time" {...form.register("horaRegreso")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaInicio">Hora inicio</Label>
            <Input id="horaInicio" type="time" {...form.register("horaInicio")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaFin">Hora fin</Label>
            <Input id="horaFin" type="time" {...form.register("horaFin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pasajeros">Pasajeros</Label>
            <Input id="pasajeros" type="number" {...form.register("pasajeros")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tarifaAplicada">Tarifa aplicada</Label>
            <Input id="tarifaAplicada" type="number" step="0.01" {...form.register("tarifaAplicada")} />
            {form.formState.errors.tarifaAplicada && <p className="text-xs text-destructive">{form.formState.errors.tarifaAplicada.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ingresoEsperado">Ingreso esperado</Label>
            <Input id="ingresoEsperado" type="number" step="0.01" {...form.register("ingresoEsperado")} />
          </div>
          {(defaultValues?.id as string | undefined) && (
            <div className="space-y-2">
              <Label htmlFor="ingresoReal">Ingreso real</Label>
              <Input id="ingresoReal" type="number" step="0.01" {...form.register("ingresoReal")} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Input id="notas" {...form.register("notas")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="observacionesOperativas">Observaciones operativas</Label>
            <textarea id="observacionesOperativas" rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...form.register("observacionesOperativas")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="realizadoPor">Realizado por</Label>
            <Select onValueChange={(v) => form.setValue("realizadoPor", v as "PROPIO" | "TERCERO")} defaultValue={(defaultValues?.realizadoPor as string | undefined) ?? "PROPIO"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPIO">Propio</SelectItem>
                <SelectItem value="TERCERO">Tercero</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {realizadoPor === "TERCERO" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="terceroId">Proveedor / Tercero</Label>
                <Select onValueChange={(v) => form.setValue("terceroId", v)} defaultValue={(defaultValues?.terceroId as string | undefined) ?? ""}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    {terceros.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorAPagar">Valor a pagar</Label>
                <Input id="valorAPagar" type="number" step="0.01" {...form.register("valorAPagar")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaVencimientoPago">Fecha de vencimiento</Label>
                <Input id="fechaVencimientoPago" type="date" {...form.register("fechaVencimientoPago")} />
              </div>
            </>
          )}
        </div>
        <FormActions />
      </form>
      <QuickCreateCliente open={showClienteModal} onOpenChange={setShowClienteModal} onClienteCreated={handleClienteCreated} />
    </>
  );
}
