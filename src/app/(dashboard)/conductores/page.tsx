import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getConductores } from "@/features/conductores/server/queries";
import { deleteConductor } from "@/features/conductores/server/actions";

const estadoBadge: Record<string, "default" | "success" | "secondary"> = {
  DISPONIBLE: "success",
  EN_SERVICIO: "default",
  DE_BAJA: "secondary",
};
const estadoLabels: Record<string, string> = {
  DISPONIBLE: "Disponible", EN_SERVICIO: "En servicio", DE_BAJA: "De baja",
};

export default async function ConductoresPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getConductores(searchParams);

  return (
    <div>
      <PageHeader title="Conductores" description="Gestiona tus conductores">
        <Link href="/conductores/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo conductor</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por nombre o licencia..." />
      </div>

      <DataTable
        columns={[
          { header: "Nombre", cell: (c) => (
            <Link href={`/conductores/${c.id}`} className="font-medium hover:underline">{c.nombre}</Link>
          )},
          { header: "Documento", cell: (c) => c.documento || "-" },
          { header: "Licencia", cell: (c) => c.licencia },
          { header: "Teléfono", cell: (c) => c.telefono || "-" },
          { header: "Estado", cell: (c) => (
            <Badge variant={estadoBadge[c.estado]}>{estadoLabels[c.estado]}</Badge>
          )},
          { header: "Acciones", cell: (c) => (
            <div className="flex gap-2">
              <Link href={`/conductores/${c.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteConductor.bind(null, c.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay conductores"
        emptyDescription="Registra un conductor para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
