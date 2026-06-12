import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVehiculo } from "@/features/vehiculos/server/queries";
import { deleteVehiculo } from "@/features/vehiculos/server/actions";
import { formatDate } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  CAMION: "Camión", CAMIONETA: "Camioneta", TRAILER: "Tráiler",
  VOLQUETE: "Volquete", GRUA: "Grúa", OTRO: "Otro",
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

export default async function VehiculoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vehiculo = await getVehiculo(id);
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
          <CardHeader><CardTitle className="text-sm">Auditoría</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Creado</span><span>{formatDate(vehiculo.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span>{formatDate(vehiculo.updatedAt)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
