import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getServicios } from "@/features/servicios/server/queries";
import { deleteServicio } from "@/features/servicios/server/actions";
import { formatDate, formatCurrency } from "@/lib/utils";

const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  PROGRAMADO: "warning",
  EN_CURSO: "default",
  COMPLETADO: "success",
  CANCELADO: "secondary",
};
const estadoLabels: Record<string, string> = {
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

export default async function ServiciosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getServicios(searchParams);

  return (
    <div>
      <PageHeader title="Servicios" description="Gestiona los servicios de transporte">
        <Link href="/servicios/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo servicio</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por origen, destino o contrato..." />
      </div>

      <DataTable
        columns={[
          { header: "Fecha", cell: (s) => formatDate(s.fecha) },
          { header: "Contrato", cell: (s) => (
            <Link href={`/servicios/${s.id}`} className="font-medium hover:underline">{s.contrato.nombre}</Link>
          )},
          { header: "Origen", cell: (s) => s.origen || "-" },
          { header: "Destino", cell: (s) => s.destino || "-" },
          { header: "Vehículo", cell: (s) => s.vehiculo?.placa || "-" },
          { header: "Conductor", cell: (s) => s.conductor?.nombre || "-" },
          { header: "Tarifa", cell: (s) => formatCurrency(s.tarifaAplicada) },
          { header: "Estado", cell: (s) => (
            <Badge variant={estadoBadge[s.estado]}>{estadoLabels[s.estado]}</Badge>
          )},
          { header: "Acciones", cell: (s) => (
            <div className="flex gap-2">
              <Link href={`/servicios/${s.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteServicio.bind(null, s.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay servicios"
        emptyDescription="Registra un servicio para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
