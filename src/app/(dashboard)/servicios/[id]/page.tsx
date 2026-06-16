import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServicio } from "@/features/servicios/server/queries";
import { deleteServicio } from "@/features/servicios/server/actions";
import { formatDate, formatCurrency } from "@/lib/utils";
import { totalCostos, margenUtilidad, type ServicioWithCostos } from "@/features/servicios/utils/rentabilidad";

const estadoLabels: Record<string, string> = {
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

export default async function ServicioDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const servicio = await getServicio(id);
  if (!servicio) notFound();

  const svc = servicio as unknown as ServicioWithCostos;
  const totalCost = totalCostos(svc);
  const margen = margenUtilidad(svc);

  return (
    <div>
      <PageHeader title={`Servicio del ${formatDate(servicio.fecha)}`} description={servicio.contrato.nombre}>
        <div className="flex gap-2">
          <Link href={`/servicios/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteServicio.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información del servicio</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Contrato</span><span>{servicio.contrato.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{servicio.tipoServicio}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge>{estadoLabels[servicio.estado]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Origen</span><span>{servicio.origen || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Destino</span><span>{servicio.destino || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Hora salida</span><span>{servicio.horaSalida ? formatDate(servicio.horaSalida) + " " + servicio.horaSalida.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pasajeros</span><span>{servicio.pasajeros ?? "-"}</span></div>
            {servicio.fechaRegreso && (
              <div className="flex justify-between"><span className="text-muted-foreground">Regreso</span><span>{formatDate(servicio.fechaRegreso)}{servicio.horaRegreso ? " " + servicio.horaRegreso.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : ""}</span></div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Recursos</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vehículo</span><span>{servicio.vehiculo?.placa || "Sin asignar"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Conductor</span><span>{servicio.conductor?.nombre || "Sin asignar"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Financiero</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tarifa</span><span className="font-semibold">{formatCurrency(servicio.tarifaAplicada)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ingreso esperado</span><span>{formatCurrency(servicio.ingresoEsperado)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ingreso real</span><span className="font-semibold">{servicio.ingresoReal ? formatCurrency(servicio.ingresoReal) : "Pendiente"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total costos</span><span>{formatCurrency(totalCost)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Margen de utilidad</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            <p className={`text-2xl font-bold ${margen !== null && margen >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {margen !== null ? `${margen.toFixed(1)}%` : "N/D"}
            </p>
          </CardContent>
        </Card>
      </div>

      {servicio.notas && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Notas</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{servicio.notas}</p></CardContent>
        </Card>
      )}
      {servicio.observacionesOperativas && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Observaciones operativas</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{servicio.observacionesOperativas}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
