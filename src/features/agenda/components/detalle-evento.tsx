"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AsignacionStatus } from "@/components/shared/asignacion-status";
import { estadoCalendario } from "../utils/colors";

const estadoLabels: Record<string, string> = {
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

function fmtFecha(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function fmtHora(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EventoData {
  id: string;
  codigo: string | null;
  estado: string;
  fecha: Date;
  horaSalida: Date | null;
  fechaRegreso: Date | null;
  horaRegreso: Date | null;
  origen: string | null;
  destino: string | null;
  pasajeros: number | null;
  observacionesOperativas: string | null;
  contrato: { nombre: string; codigo: string | null; cliente: { nombre: string } | null } | null;
  vehiculo: { placa: string } | null;
  conductor: { nombre: string } | null;
}

export function DetalleEventoSheet({
  servicio,
  open,
  onOpenChange,
}: {
  servicio: EventoData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!servicio) return null;
  const ec = estadoCalendario[servicio.estado] ?? estadoCalendario.PROGRAMADO;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${ec.dot}`} />
            {servicio.codigo ?? "Servicio"}
          </SheetTitle>
          <SheetDescription>
            <Badge variant="outline" className={ec.text}>{estadoLabels[servicio.estado]}</Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Cliente</p>
            <p className="font-medium">{servicio.contrato?.cliente?.nombre || servicio.contrato?.nombre || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Contrato</p>
            <p>{servicio.contrato?.nombre} ({servicio.contrato?.codigo})</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Vehículo</p>
              <p className="font-medium">{servicio.vehiculo?.placa || "Sin asignar"}</p>
            </div>
            <AsignacionStatus vehiculo={servicio.vehiculo} conductor={servicio.conductor} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Pasajeros</p>
            <p>{servicio.pasajeros ?? "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Origen</p>
              <p>{servicio.origen || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Destino</p>
              <p>{servicio.destino || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Salida</p>
              <p>{servicio.horaSalida ? `${fmtFecha(servicio.horaSalida)} ${fmtHora(servicio.horaSalida)}` : fmtFecha(servicio.fecha)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Regreso</p>
              <p>{servicio.fechaRegreso && servicio.horaRegreso ? `${fmtFecha(servicio.fechaRegreso)} ${fmtHora(servicio.horaRegreso)}` : "-"}</p>
            </div>
          </div>
          {servicio.observacionesOperativas && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">Observaciones operativas</p>
              <p className="whitespace-pre-wrap">{servicio.observacionesOperativas}</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href={`/servicios/${servicio.id}`}>
            <Button className="w-full">Ver detalle completo</Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
