import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCliente } from "@/features/clientes/server/queries";
import { deleteCliente } from "@/features/clientes/server/actions";
import { formatDate } from "@/lib/utils";

export default async function ClienteDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  return (
    <div>
      <PageHeader title={cliente.nombre} description={`RFC: ${cliente.rfc}`}>
        <div className="flex gap-2">
          <Link href={`/clientes/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteCliente.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">RFC</span><span>{cliente.rfc}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={cliente.active ? "success" : "secondary"}>{cliente.active ? "Activo" : "Inactivo"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Creado</span><span>{formatDate(cliente.createdAt)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span>{cliente.contactoNombre || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{cliente.contactoEmail || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{cliente.contactoTelefono || "-"}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
