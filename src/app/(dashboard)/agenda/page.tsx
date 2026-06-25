import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AsignacionStatus } from "@/components/shared/asignacion-status";
import { getAgendaServicios } from "@/features/agenda/server/queries";
import { VistaCalendario } from "@/features/agenda/components/vista-calendario";

const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  PROGRAMADO: "warning", EN_CURSO: "default", COMPLETADO: "success", CANCELADO: "secondary",
};
const estadoLabels: Record<string, string> = {
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

function fmtDateTime(d: Date, showDate = true): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fecha = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return showDate ? `${fecha} ${hora}` : hora;
}

function fmtFecha(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function getHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BadgeTipo(props: { servicio: { fechaRegreso: Date | null; horaRegreso: Date | null } }) {
  const { servicio } = props;
  if (servicio.fechaRegreso && servicio.horaRegreso) {
    return <Badge variant="secondary" className="text-xs">Ida y Regreso</Badge>;
  }
  if (servicio.fechaRegreso) {
    return <Badge variant="secondary" className="text-xs">Ida y Regreso</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">Solo Ida</Badge>;
}

function SalidaRegreso({ servicio }: { servicio: { fecha: Date; horaSalida: Date | null; fechaRegreso: Date | null; horaRegreso: Date | null } }) {
  const salidaStr = servicio.horaSalida ? fmtDateTime(servicio.horaSalida) : fmtFecha(servicio.fecha);
  if (servicio.fechaRegreso && servicio.horaRegreso) {
    return (
      <span className="text-muted-foreground">
        <strong>Salida:</strong> {salidaStr} &nbsp;|&nbsp; <strong>Regreso:</strong> {fmtDateTime(servicio.horaRegreso)}
      </span>
    );
  }
  return <span className="text-muted-foreground"><strong>Salida:</strong> {salidaStr}</span>;
}

function Indicadores({ data }: { data: Awaited<ReturnType<typeof getAgendaServicios>> }) {
  const now = new Date();
  const hoyStr = now.toDateString();
  const activos = data.servicios.filter((s) => s.estado === "EN_CURSO").length;
  const conductoresHoy = new Set(
    data.servicios.filter((s) => s.fecha.toDateString() === hoyStr && s.conductorId).map((s) => s.conductorId)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Serv. hoy</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{data.serviciosHoy}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Serv. semana</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{data.totalServicios}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Serv. activos</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{activos}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Pasajeros prog.</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{data.totalPasajeros}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Veh. ocupados hoy</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{data.vehiculosOcupados}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Cond. ocupados hoy</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{conductoresHoy.size}</p></CardContent></Card>
      <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium">Serv. mes</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{data.totalServicios}</p></CardContent></Card>
    </div>
  );
}

async function AgendaContent({ searchParams }: { searchParams: Record<string, string> }) {
  const fecha = searchParams.fecha || getHoy();
  const rango = (searchParams.rango as "dia" | "semana" | "mes" | "calendario") || "dia";
  const data = await getAgendaServicios(fecha, rango === "calendario" ? "mes" : rango);

  return (
    <div>
      <Indicadores data={data} />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Link href={`/agenda?fecha=${fecha}&rango=dia`}><Badge variant={rango === "dia" ? "default" : "outline"}>Día</Badge></Link>
            <Link href={`/agenda?fecha=${fecha}&rango=semana`}><Badge variant={rango === "semana" ? "default" : "outline"}>Semana</Badge></Link>
            <Link href={`/agenda?fecha=${fecha}&rango=mes`}><Badge variant={rango === "mes" ? "default" : "outline"}>Mes</Badge></Link>
            <Link href={`/agenda?fecha=${fecha}&rango=calendario`}><Badge variant={rango === "calendario" ? "default" : "outline"}>Calendario</Badge></Link>
            <span className="text-sm text-muted-foreground ml-auto">
              {fmtFecha(data.desde)}{data.desde.toDateString() !== data.hasta.toDateString() ? ` - ${fmtFecha(data.hasta)}` : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {rango === "calendario" && (
        <VistaCalendario servicios={data.servicios} />
      )}

      {rango === "dia" && (
        <div className="space-y-3">
          {data.servicios.length === 0 && <p className="text-muted-foreground text-center py-8">Sin servicios este día</p>}
          {data.servicios.map((s) => (
            <Link key={s.id} href={`/servicios/${s.id}`} className="block">
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={estadoBadge[s.estado]}>{estadoLabels[s.estado]}</Badge>
                    <span className="text-xs text-muted-foreground">{s.codigo}</span>
                    <span className="text-sm font-medium">{s.contrato?.cliente?.nombre || s.contrato?.nombre}</span>
                    <Badge variant="outline">{s.contrato?.codigo}</Badge>
                    <BadgeTipo servicio={s} />
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                    <span>{s.origen || "-"} → {s.destino || "-"}</span>
                    <SalidaRegreso servicio={s} />
                    <AsignacionStatus vehiculo={s.vehiculo} conductor={s.conductor} />
                    {s.pasajeros != null && <span>👥 {s.pasajeros}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {rango === "semana" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Cliente</th>
                <th className="py-2 px-3 font-medium">Salida</th>
                <th className="py-2 px-3 font-medium">Regreso</th>
                <th className="py-2 px-3 font-medium">Origen</th>
                <th className="py-2 px-3 font-medium">Destino</th>
                <th className="py-2 px-3 font-medium">Vehículo</th>
                <th className="py-2 px-3 font-medium">Conductor</th>
                <th className="py-2 px-3 font-medium">Asignación</th>
                <th className="py-2 px-3 font-medium">Pasajeros</th>
                <th className="py-2 px-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.servicios.map((s) => (
                <tr key={s.id} className="border-b hover:bg-accent/50">
                  <td className="py-2 px-3">
                    <Link href={`/servicios/${s.id}`} className="hover:underline font-medium">
                      {s.contrato?.cliente?.nombre || s.contrato?.nombre || "-"}
                    </Link>
                    <div className="text-xs text-muted-foreground">{s.contrato?.codigo} · {fmtFecha(s.fecha)}</div>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {s.horaSalida ? fmtDateTime(s.horaSalida) : fmtFecha(s.fecha)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {s.fechaRegreso && s.horaRegreso ? (
                      <span>{fmtDateTime(s.horaRegreso)}</span>
                    ) : s.fechaRegreso ? (
                      <span>{fmtFecha(s.fechaRegreso)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3">{s.origen || "-"}</td>
                  <td className="py-2 px-3">{s.destino || "-"}</td>
                  <td className="py-2 px-3 font-medium">{s.vehiculo?.placa || "-"}</td>
                  <td className="py-2 px-3">{s.conductor?.nombre || "-"}</td>
                  <td className="py-2 px-3"><AsignacionStatus vehiculo={s.vehiculo} conductor={s.conductor} /></td>
                  <td className="py-2 px-3">{s.pasajeros ?? "-"}</td>
                  <td className="py-2 px-3"><Badge variant={estadoBadge[s.estado]}>{estadoLabels[s.estado]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.servicios.length === 0 && <p className="text-muted-foreground text-center py-8">Sin servicios en este período</p>}
        </div>
      )}

      {rango === "mes" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Cliente</th>
                <th className="py-2 px-3 font-medium">Salida</th>
                <th className="py-2 px-3 font-medium">Regreso</th>
                <th className="py-2 px-3 font-medium">Origen</th>
                <th className="py-2 px-3 font-medium">Destino</th>
                <th className="py-2 px-3 font-medium">Vehículo</th>
                <th className="py-2 px-3 font-medium">Conductor</th>
                <th className="py-2 px-3 font-medium">Asignación</th>
                <th className="py-2 px-3 font-medium">Pasajeros</th>
                <th className="py-2 px-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.servicios.map((s) => (
                <tr key={s.id} className="border-b hover:bg-accent/50">
                  <td className="py-2 px-3">
                    <Link href={`/servicios/${s.id}`} className="hover:underline font-medium">
                      {s.contrato?.cliente?.nombre || s.contrato?.nombre || "-"}
                    </Link>
                    <div className="text-xs text-muted-foreground">{s.contrato?.codigo} · {fmtFecha(s.fecha)}</div>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {s.horaSalida ? fmtDateTime(s.horaSalida) : fmtFecha(s.fecha)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {s.fechaRegreso && s.horaRegreso ? (
                      <span>{fmtDateTime(s.horaRegreso)}</span>
                    ) : s.fechaRegreso ? (
                      <span>{fmtFecha(s.fechaRegreso)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3">{s.origen || "-"}</td>
                  <td className="py-2 px-3">{s.destino || "-"}</td>
                  <td className="py-2 px-3 font-medium">{s.vehiculo?.placa || "-"}</td>
                  <td className="py-2 px-3">{s.conductor?.nombre || "-"}</td>
                  <td className="py-2 px-3"><AsignacionStatus vehiculo={s.vehiculo} conductor={s.conductor} /></td>
                  <td className="py-2 px-3">{s.pasajeros ?? "-"}</td>
                  <td className="py-2 px-3"><Badge variant={estadoBadge[s.estado]}>{estadoLabels[s.estado]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.servicios.length === 0 && <p className="text-muted-foreground text-center py-8">Sin servicios en este período</p>}
        </div>
      )}
    </div>
  );
}

export default async function AgendaPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  return (
    <div>
      <PageHeader title="Agenda operativa" description="Programación de servicios por día, semana, mes o calendario">
        <Link href="/servicios/nuevo"><Button><Plus className="h-4 w-4" /> Nuevo servicio</Button></Link>
      </PageHeader>
      <Suspense fallback={<p className="text-center py-8">Cargando agenda...</p>}>
        <AgendaContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
