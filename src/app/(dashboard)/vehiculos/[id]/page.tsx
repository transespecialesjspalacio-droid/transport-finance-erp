import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVehiculoDetalle } from "@/features/vehiculos/server/queries";
import { deleteVehiculo } from "@/features/vehiculos/server/actions";
import { formatDate, formatCurrency } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  BUS: "Bus", BUSETON: "Busetón", BUSETA: "Buseta",
};
const propietarioLabels: Record<string, string> = {
  PROPIO: "Propio", TERCERO: "Tercero",
};
const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  DISPONIBLE: "success", EN_SERVICIO: "default",
  EN_MANTENIMIENTO: "warning", FUERA_DE_SERVICIO: "secondary",
};
const estadoLabels: Record<string, string> = {
  DISPONIBLE: "Disponible", EN_SERVICIO: "En servicio",
  EN_MANTENIMIENTO: "En mantenimiento", FUERA_DE_SERVICIO: "Fuera de servicio",
};

function VencimientoBadge({ fecha, label }: { fecha: Date | null | undefined; label: string }) {
  if (!fecha) return null;
  const dias = Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={dias < 0 ? "text-destructive font-medium" : dias <= 30 ? "text-warning font-medium" : ""}>
        {formatDate(fecha)} {dias < 0 ? `(vencido hace ${Math.abs(dias)}d)` : `(${dias}d)`}
      </span>
    </div>
  );
}

export default async function VehiculoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vehiculo = await getVehiculoDetalle(id);
  if (!vehiculo) notFound();

  return (
    <div>
      <PageHeader title={`${vehiculo.marca} ${vehiculo.modelo}`} description={`Placa: ${vehiculo.placa}`}>
        <div className="flex gap-2">
          <Link href={`/vehiculos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteVehiculo.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      {/* Fase 1: Hoja de vida */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Placa</span><span className="font-medium">{vehiculo.placa}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Marca</span><span>{vehiculo.marca}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Modelo</span><span>{vehiculo.modelo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Año</span><span>{vehiculo.anio}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Capacidad</span><span>{vehiculo.capacidad}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Clasificación</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{tipoLabels[vehiculo.tipoVehiculo]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Propietario</span><span>{propietarioLabels[vehiculo.propietario]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={estadoBadge[vehiculo.estado]}>{estadoLabels[vehiculo.estado]}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Documentos y vencimientos</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <VencimientoBadge fecha={vehiculo.fechaVencimientoSOAT} label="Vencimiento SOAT" />
            <VencimientoBadge fecha={vehiculo.fechaVencimientoTecnomecanica} label="Vencimiento Tecnomecánica" />
            <VencimientoBadge fecha={vehiculo.fechaVencimientoPoliza} label="Vencimiento Póliza" />
          </CardContent>
        </Card>
      </div>

      {/* Observaciones */}
      {vehiculo.observaciones && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Observaciones</CardTitle></CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{vehiculo.observaciones}</CardContent>
        </Card>
      )}

      {/* Fase 3: Rentabilidad por vehículo */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Ingresos</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-success">{formatCurrency(vehiculo.rentabilidad.ingresos)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Costos</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-destructive">{formatCurrency(vehiculo.rentabilidad.costos)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Utilidad</CardTitle></CardHeader>
          <CardContent><p className={`text-xl font-bold ${vehiculo.rentabilidad.utilidad >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(vehiculo.rentabilidad.utilidad)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Margen</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{vehiculo.rentabilidad.margen.toFixed(1)}%</p></CardContent>
        </Card>
      </div>

      {/* Fase 2: Costos por vehículo */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Costos por categoría</CardTitle></CardHeader>
          <CardContent>
            {vehiculo.costosPorCategoria.length > 0 ? (
              <div className="space-y-2 text-sm">
                {vehiculo.costosPorCategoria.map((c) => (
                  <div key={c.categoria} className="flex justify-between">
                    <span className="text-muted-foreground">{c.categoria}</span>
                    <span className="font-medium">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay costos registrados</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Servicios ({vehiculo.rentabilidad.servicios})</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm max-h-60 overflow-y-auto">
            {vehiculo.servicios.map((sv) => (
              <div key={sv.id} className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">{sv.codigo ?? "—"}</span>
                <span>{formatCurrency(Number(sv.ingresoReal ?? sv.ingresoEsperado))}</span>
              </div>
            ))}
            {vehiculo.servicios.length === 0 && (
              <p className="text-muted-foreground">Sin servicios registrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
