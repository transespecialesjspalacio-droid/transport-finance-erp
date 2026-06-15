import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getContratos } from "@/features/contratos/server/queries";
import { deleteContrato } from "@/features/contratos/server/actions";
import { formatDate, formatCurrency } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  ESCOLAR: "Escolar", CORPORATIVO: "Corporativo", MEDICO: "Médico", EVENTO: "Evento",
};
const tipoContratoLabels: Record<string, string> = {
  POR_SERVICIOS: "Por servicios", RECURRENTE: "Recurrente", MIXTO: "Mixto",
};
const tipoContratoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  POR_SERVICIOS: "secondary", RECURRENTE: "success", MIXTO: "warning",
};

export default async function ContratosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getContratos(searchParams);

  return (
    <div>
      <PageHeader title="Contratos" description="Gestiona los contratos con clientes">
        <Link href="/contratos/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo contrato</Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Buscar por código, nombre o cliente..." />
      </div>

      <DataTable
        columns={[
          { header: "Código", cell: (c) => (
            <Link href={`/contratos/${c.id}`} className="font-medium hover:underline">{c.codigo}</Link>
          )},
          { header: "Nombre", cell: (c) => c.nombre },
          { header: "Cliente", cell: (c) => c.cliente.nombre },
          { header: "Tipo", cell: (c) => (
            <div className="flex gap-1">
              <Badge variant="outline">{tipoLabels[c.tipoServicio]}</Badge>
              <Badge variant={tipoContratoBadge[c.tipoContrato]}>{tipoContratoLabels[c.tipoContrato]}</Badge>
            </div>
          )},
          { header: "Valor recurrente", cell: (c) => c.tipoContrato !== "POR_SERVICIOS" && c.valorRecurrente ? formatCurrency(c.valorRecurrente) : "-" },
          { header: "Inicio", cell: (c) => formatDate(c.fechaInicio) },
          { header: "Estado", cell: (c) => (
            <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Vigente" : "Inactivo"}</Badge>
          )},
          { header: "Acciones", cell: (c) => (
            <div className="flex gap-2">
              <Link href={`/contratos/${c.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteContrato.bind(null, c.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay contratos"
        emptyDescription="Crea un contrato para comenzar a registrar servicios."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
