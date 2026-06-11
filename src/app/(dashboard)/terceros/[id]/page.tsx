import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTercero } from "@/features/terceros/server/queries";
import { deleteTercero } from "@/features/terceros/server/actions";
import { formatDate } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  TRANSPORTADOR: "Transportador", CONDUCTOR: "Conductor", COMBUSTIBLE: "Combustible",
  PEAJES: "Peajes", MANTENIMIENTO: "Mantenimiento", OTRO: "Otro",
};

export default async function TerceroDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const tercero = await getTercero(id);
  if (!tercero) notFound();

  return (
    <div>
      <PageHeader title={tercero.nombre} description={tipoLabels[tercero.tipoTercero]}>
        <div className="flex gap-2">
          <Link href={`/terceros/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteTercero.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">RFC</span><span>{tercero.rfc || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><Badge>{tipoLabels[tercero.tipoTercero]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contacto</span><span>{tercero.contacto || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={tercero.active ? "success" : "secondary"}>{tercero.active ? "Activo" : "Inactivo"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Registrado</span><span>{formatDate(tercero.createdAt)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
