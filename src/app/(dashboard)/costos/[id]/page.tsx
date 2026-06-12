import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCosto } from "@/features/costos/server/queries";
import { deleteCosto } from "@/features/costos/server/actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CostoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const costo = await getCosto(id);
  if (!costo) notFound();

  return (
    <div>
      <PageHeader title="Costo" description={costo.descripcion}>
        <div className="flex gap-2">
          <Link href={`/costos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteCosto.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información del costo</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicio</span>
              <Link href={`/servicios/${costo.servicio.id}`} className="font-medium hover:underline">
                {costo.servicio.codigo || `${costo.servicio.origen || ""} → ${costo.servicio.destino || ""}`}
              </Link>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{costo.tipoCosto.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Descripción</span><span>{costo.descripcion}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span>{formatCurrency(costo.monto)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cantidad</span><span>{Number(costo.cantidad)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span>{formatCurrency(costo.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{formatDate(costo.fecha)}</span></div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Proveedor</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {costo.tercero ? (
                <span>{costo.tercero.nombre}</span>
              ) : (
                <span className="text-muted-foreground">Sin proveedor</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Auditoría</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Creado</span><span>{formatDate(costo.createdAt)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
