"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inicioOcupacion, finOcupacion } from "../utils/ocupacion";
import { estadoCalendario } from "../utils/colors";
import { esFestivo } from "../utils/festivos";
import { DetalleEventoSheet } from "./detalle-evento";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MAX_EVENTOS_VISIBLES = 3;

function esHoy(d: Date): boolean {
  const h = new Date();
  return d.getDate() === h.getDate() && d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear();
}

function esDomingo(d: Date): boolean {
  return d.getDay() === 0;
}

function fmtHora(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface ServicioData {
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

type EventoCalendario = {
  servicio: ServicioData;
  inicio: Date;
  fin: Date;
  esInicio: boolean;
  esFin: boolean;
};

export function VistaCalendario({ servicios: raw }: { servicios: ServicioData[] }) {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [selected, setSelected] = useState<ServicioData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cambiarMes = useCallback((delta: number) => {
    setMes((prev) => {
      const nuevo = prev + delta;
      if (nuevo < 0) { setAnio((a) => a - 1); return 11; }
      if (nuevo > 11) { setAnio((a) => a + 1); return 0; }
      return nuevo;
    });
  }, []);

  const irAHoy = useCallback(() => {
    const h = new Date();
    setAnio(h.getFullYear());
    setMes(h.getMonth());
  }, []);

  const eventos = useMemo(() => {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    const inicioRango = new Date(primerDia);
    inicioRango.setDate(inicioRango.getDate() - inicioRango.getDay() + 1); // lunes anterior o el mismo

    const finRango = new Date(ultimoDia);
    const domingoOffset = finRango.getDay() === 0 ? 0 : 7 - finRango.getDay();
    finRango.setDate(finRango.getDate() + domingoOffset);

    const festivos = new Map<string, { nombre: string }>();
    for (let d = new Date(inicioRango); d <= finRango; d.setDate(d.getDate() + 1)) {
      const f = esFestivo(new Date(d));
      if (f.es) festivos.set(toDateStr(new Date(d)), { nombre: f.nombre! });
    }

    const result: { eventos: EventoCalendario[]; festivos: typeof festivos } = {
      eventos: [],
      festivos,
    };

    for (const s of raw) {
      const inicio = inicioOcupacion(s);
      const fin = finOcupacion(s);
      const d = new Date(Math.max(inicio.getTime(), inicioRango.getTime()));
      const finLimite = new Date(Math.min(fin.getTime(), finRango.getTime()));
      while (d <= finLimite) {
        result.eventos.push({
          servicio: s,
          inicio: new Date(d),
          fin: new Date(d),
          esInicio: d.toDateString() === inicio.toDateString(),
          esFin: d.toDateString() === fin.toDateString(),
        });
        d.setDate(d.getDate() + 1);
      }
    }

    return result;
  }, [raw, anio, mes]);

  const diasCalendario = useMemo(() => {
    const primerDia = new Date(anio, mes, 1);
    const inicio = new Date(primerDia);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    const dias: { date: Date; esMesActual: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      dias.push({ date: d, esMesActual: d.getMonth() === mes });
    }
    return dias;
  }, [anio, mes]);

  const handleEventClick = useCallback((s: ServicioData) => {
    setSelected(s);
    setSheetOpen(true);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => cambiarMes(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-lg font-semibold min-w-[180px] text-center">{MESES[mes]} {anio}</span>
          <Button variant="outline" size="icon" onClick={() => cambiarMes(1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={irAHoy} className="ml-2">Hoy</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
        {DIAS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-2 border-r border-b bg-muted/50 ${i === 6 ? "border-r-0" : ""}`}>
            {d}
          </div>
        ))}

        {diasCalendario.map((dia, idx) => {
          const fechaStr = toDateStr(dia.date);
          const festivo = eventos.festivos.get(fechaStr);
          const hoyClass = esHoy(dia.date) ? "ring-2 ring-inset ring-primary" : "";
          const domingoClass = esDomingo(dia.date) ? "bg-red-50 dark:bg-red-950/10" : "";
          const fueraMes = !dia.esMesActual ? "opacity-40" : "";

          const eventosDia = eventos.eventos.filter(
            (e) => e.inicio.toDateString() === dia.date.toDateString()
          );
          const visibles = eventosDia.slice(0, MAX_EVENTOS_VISIBLES);
          const mas = eventosDia.length - MAX_EVENTOS_VISIBLES;

          return (
            <div
              key={idx}
              className={`min-h-[90px] border-r border-b p-1 relative ${idx % 7 === 6 ? "border-r-0" : ""} ${hoyClass} ${domingoClass} ${fueraMes}`}
            >
              <div className="flex items-start justify-between mb-0.5">
                <span className={`text-xs font-medium ${festivo ? "text-red-600" : domingoClass ? "text-red-500" : ""}`}>
                  {dia.date.getDate()}
                </span>
              </div>

              {festivo && (
                <div className="text-[10px] text-red-600 dark:text-red-400 leading-tight mb-0.5 truncate" title={festivo.nombre}>
                  🇨🇴 {festivo.nombre}
                </div>
              )}

              <div className="space-y-0.5">
                {visibles.map((ev, i) => {
                  const ec = estadoCalendario[ev.servicio.estado] ?? estadoCalendario.PROGRAMADO;
                  const label = ev.servicio.contrato?.cliente?.nombre || ev.servicio.contrato?.nombre || "Servicio";

                  return (
                    <button
                      key={`${ev.servicio.id}-${i}`}
                      onClick={() => handleEventClick(ev.servicio)}
                      className={`w-full text-left text-[11px] leading-tight px-1 py-0.5 rounded truncate border-l-2 ${ec.bg} ${ec.text} ${ec.border} hover:brightness-95 dark:hover:brightness-125 transition-all`}
                      title={`${label} · ${ev.servicio.vehiculo?.placa || "sin vehículo"} · ${ev.servicio.conductor?.nombre || "sin conductor"}`}
                    >
                      {ev.esInicio || eventosDia.length <= 1 ? (
                        <>{label}<br /><span className="opacity-80">{ev.servicio.horaSalida ? fmtHora(ev.servicio.horaSalida) : ""}{ev.servicio.vehiculo ? ` · ${ev.servicio.vehiculo.placa}` : ""}</span></>
                      ) : (
                        <span className="opacity-70">↔ {label}</span>
                      )}
                    </button>
                  );
                })}
                {mas > 0 && (
                  <button
                    className="text-[11px] text-muted-foreground hover:text-foreground w-full text-left px-1"
                    title={`${eventosDia.length} eventos`}
                  >
                    +{mas} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DetalleEventoSheet
        servicio={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
