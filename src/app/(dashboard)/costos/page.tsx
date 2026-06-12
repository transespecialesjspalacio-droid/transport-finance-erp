import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { getCostos } from "@/features/costos/server/queries";
import { deleteCosto } from "@/features/costos/server/actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CostosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getCostos(searchParams);

  return (
    <div>
      <PageHeader title="Costos" description="Gestiona los costos operativos">
        <Link href="/costos/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo costo</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por descripción..." />
      </div>

      <DataTable
        columns={[
          { header: "Servicio", cell: (c) => (
            <Link href={`/servicios/${c.servicio.id}`} className="font-medium hover:underline">
              {c.servicio.codigo || `${c.servicio.origen || ""} → ${c.servicio.destino || ""}`}
            </Link>
          )},
          { header: "Tipo de costo", cell: (c) => c.tipoCosto.nombre },
          { header: "Descripción", cell: (c) => c.descripcion },
          { header: "Monto", cell: (c) => formatCurrency(c.monto) },
          { header: "Cantidad", cell: (c) => Number(c.cantidad) },
          { header: "Total", cell: (c) => formatCurrency(c.total) },
          { header: "Fecha", cell: (c) => formatDate(c.fecha) },
          { header: "Acciones", cell: (c) => (
            <div className="flex gap-2">
              <Link href={`/costos/${c.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteCosto.bind(null, c.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay costos"
        emptyDescription="Registra tu primer costo operativo para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
