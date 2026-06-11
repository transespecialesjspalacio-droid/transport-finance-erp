import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getClientes } from "@/features/clientes/server/queries";
import { deleteCliente } from "@/features/clientes/server/actions";

export default async function ClientesPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getClientes(searchParams);

  return (
    <div>
      <PageHeader title="Clientes" description="Gestiona tus clientes">
        <Link href="/clientes/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo cliente</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por nombre, RFC o contacto..." />
      </div>

      <DataTable
        columns={[
          { header: "Nombre", cell: (c) => (
            <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">{c.nombre}</Link>
          )},
          { header: "RFC", cell: (c) => c.rfc },
          { header: "Contacto", cell: (c) => c.contactoNombre || "-" },
          { header: "Email", cell: (c) => c.contactoEmail || "-" },
          { header: "Estado", cell: (c) => (
            <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Activo" : "Inactivo"}</Badge>
          )},
          { header: "Acciones", cell: (c) => (
            <div className="flex gap-2">
              <Link href={`/clientes/${c.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteCliente.bind(null, c.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay clientes"
        emptyDescription="Crea tu primer cliente para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
