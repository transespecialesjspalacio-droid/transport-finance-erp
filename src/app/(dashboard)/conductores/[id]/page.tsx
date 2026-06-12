import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getConductor } from "@/features/conductores/server/queries";
import { deleteConductor } from "@/features/conductores/server/actions";
import { formatDate } from "@/lib/utils";

const estadoBadge: Record<string, "default" | "success" | "secondary"> = {
  DISPONIBLE: "success",
  EN_SERVICIO: "default",
  DE_BAJA: "secondary",
};
const estadoLabels: Record<string, string> = {
  DISPONIBLE: "Disponible", EN_SERVICIO: "En servicio", DE_BAJA: "De baja",
};

export default async function ConductorDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const conductor = await getConductor(id);
  if (!conductor) notFound();

  return (
    <div>
      <PageHeader title={conductor.nombre} description={`Licencia: ${conductor.licencia}`}>
        <div className="flex gap-2">
          <Link href={`/conductores/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteConductor.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span>{conductor.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Documento</span><span>{conductor.documento || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Licencia</span><span>{conductor.licencia}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span>{conductor.categoria || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{conductor.telefono || "-"}</span></div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Estado y vigencia</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={estadoBadge[conductor.estado]}>{estadoLabels[conductor.estado]}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vencimiento de licencia</span><span>{conductor.fechaVencimiento ? formatDate(conductor.fechaVencimiento) : "-"}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Auditoría</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Creado</span><span>{formatDate(conductor.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Actualizado</span><span>{formatDate(conductor.updatedAt)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
