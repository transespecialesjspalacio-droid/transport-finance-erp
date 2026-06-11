import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getTerceros } from "@/features/terceros/server/queries";
import { deleteTercero } from "@/features/terceros/server/actions";

const tipoLabels: Record<string, string> = {
  TRANSPORTADOR: "Transportador",
  CONDUCTOR: "Conductor",
  COMBUSTIBLE: "Combustible",
  PEAJES: "Peajes",
  MANTENIMIENTO: "Mantenimiento",
  OTRO: "Otro",
};

const tipoColors: Record<string, "default" | "secondary" | "warning" | "success" | "outline"> = {
  TRANSPORTADOR: "default",
  CONDUCTOR: "secondary",
  COMBUSTIBLE: "warning",
  PEAJES: "outline",
  MANTENIMIENTO: "success",
  OTRO: "secondary",
};

export default async function TercerosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getTerceros(searchParams);

  return (
    <div>
      <PageHeader title="Terceros" description="Proveedores, transportadores y otros terceros">
        <Link href="/terceros/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo tercero</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por nombre o contacto..." />
      </div>

      <DataTable
        columns={[
          { header: "Nombre", cell: (t) => (
            <Link href={`/terceros/${t.id}`} className="font-medium hover:underline">{t.nombre}</Link>
          )},
          { header: "RFC", cell: (t) => t.rfc || "-" },
          { header: "Tipo", cell: (t) => (
            <Badge variant={tipoColors[t.tipoTercero] ?? "secondary"}>{tipoLabels[t.tipoTercero]}</Badge>
          )},
          { header: "Contacto", cell: (t) => t.contacto || "-" },
          { header: "Estado", cell: (t) => (
            <Badge variant={t.active ? "success" : "secondary"}>{t.active ? "Activo" : "Inactivo"}</Badge>
          )},
          { header: "Acciones", cell: (t) => (
            <div className="flex gap-2">
              <Link href={`/terceros/${t.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteTercero.bind(null, t.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay terceros"
        emptyDescription="Registra transportadores, proveedores de combustible, etc."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
