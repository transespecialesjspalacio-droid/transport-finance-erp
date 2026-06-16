import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgendaServicios } from "@/features/agenda/server/queries";
import { formatDate } from "@/lib/utils";

const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  PROGRAMADO: "warning", EN_CURSO: "default", COMPLETADO: "success", CANCELADO: "secondary",
};
const estadoLabels: Record<string, string> = {
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

function getHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function AgendaContent({ searchParams }: { searchParams: Record<string, string> }) {
  const fecha = searchParams.fecha || getHoy();
  const rango = (searchParams.rango as "dia" | "semana" | "mes") || "dia";
  const data = await getAgendaServicios(fecha, rango);

  return (
    <div>
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Link href={`/agenda?fecha=${fecha}&rango=dia`}><Badge variant={rango === "dia" ? "default" : "outline"}>Día</Badge></Link>
            <Link href={`/agenda?fecha=${fecha}&rango=semana`}><Badge variant={rango === "semana" ? "default" : "outline"}>Semana</Badge></Link>
            <Link href={`/agenda?fecha=${fecha}&rango=mes`}><Badge variant={rango === "mes" ? "default" : "outline"}>Mes</Badge></Link>
            <span className="text-sm text-muted-foreground ml-auto">
              {formatDate(data.desde)}{data.desde.toDateString() !== data.hasta.toDateString() ? ` - ${formatDate(data.hasta)}` : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Serv. hoy</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.serviciosHoy}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Serv. total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.totalServicios}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pasajeros prog.</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.totalPasajeros}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Veh. ocupados</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.vehiculosOcupados}</p></CardContent></Card>
      </div>

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
                    {s.fechaRegreso && s.horaRegreso ? (
                      <Badge variant="secondary" className="text-xs">Ida y Regreso</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Solo Ida</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                    <span>{s.origen || "-"} → {s.destino || "-"}</span>
                    <span className="text-muted-foreground">
                      {s.fecha && formatDate(s.fecha)}
                      {s.horaSalida && ` · ${s.horaSalida.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`}
                    </span>
                    {s.vehiculo && <span>🚛 {s.vehiculo.placa}</span>}
                    {s.conductor && <span>👤 {s.conductor.nombre}</span>}
                    {s.pasajeros != null && <span>👥 {s.pasajeros}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {rango !== "dia" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Fecha</th>
                <th className="py-2 px-3 font-medium">Hora</th>
                <th className="py-2 px-3 font-medium">Cliente</th>
                <th className="py-2 px-3 font-medium">Contrato</th>
                <th className="py-2 px-3 font-medium">Origen</th>
                <th className="py-2 px-3 font-medium">Destino</th>
                <th className="py-2 px-3 font-medium">Vehículo</th>
                <th className="py-2 px-3 font-medium">Conductor</th>
                <th className="py-2 px-3 font-medium">Pasajeros</th>
                <th className="py-2 px-3 font-medium">Estado</th>
                <th className="py-2 px-3 font-medium">Viaje</th>
              </tr>
            </thead>
            <tbody>
              {data.servicios.map((s) => (
                <tr key={s.id} className="border-b hover:bg-accent/50">
                  <td className="py-2 px-3"><Link href={`/servicios/${s.id}`} className="hover:underline">{formatDate(s.fecha)}</Link></td>
                  <td className="py-2 px-3">{s.horaSalida ? s.horaSalida.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                  <td className="py-2 px-3">{s.contrato?.cliente?.nombre || "-"}</td>
                  <td className="py-2 px-3">{s.contrato?.codigo}</td>
                  <td className="py-2 px-3">{s.origen || "-"}</td>
                  <td className="py-2 px-3">{s.destino || "-"}</td>
                  <td className="py-2 px-3">{s.vehiculo?.placa || "-"}</td>
                  <td className="py-2 px-3">{s.conductor?.nombre || "-"}</td>
                  <td className="py-2 px-3">{s.pasajeros ?? "-"}</td>
                  <td className="py-2 px-3"><Badge variant={estadoBadge[s.estado]}>{estadoLabels[s.estado]}</Badge></td>
                  <td className="py-2 px-3">
                    <Badge variant="secondary" className="text-xs">
                      {s.fechaRegreso && s.horaRegreso ? "Ida y Regreso" : "Solo Ida"}
                    </Badge>
                  </td>
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
      <PageHeader title="Agenda operativa" description="Programación de servicios por día, semana o mes">
        <Link href="/servicios/nuevo"><Button><Plus className="h-4 w-4" /> Nuevo servicio</Button></Link>
      </PageHeader>
      <Suspense fallback={<p className="text-center py-8">Cargando agenda...</p>}>
        <AgendaContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
