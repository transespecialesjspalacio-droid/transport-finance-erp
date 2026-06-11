import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCuentasCobrar } from "@/features/cuentas-cobrar/server/queries";
import { deleteCuentaCobrar } from "@/features/cuentas-cobrar/server/actions";

const estadoBadge: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDIENTE: "warning",
  PARCIAL: "secondary",
  PAGADO: "success",
  VENCIDO: "destructive",
};

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
};

export default async function CuentasCobrarPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getCuentasCobrar(searchParams);

  return (
    <div>
      <PageHeader title="Cuentas por Cobrar" description="Gestiona las cuentas por cobrar a clientes">
        <Link href="/cuentas-cobrar/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nueva cuenta</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por factura, cliente o contrato..." />
      </div>

      <DataTable
        columns={[
          { header: "Cliente", cell: (c) => (
            <Link href={`/cuentas-cobrar/${c.id}`} className="font-medium hover:underline">{c.cliente.nombre}</Link>
          )},
          { header: "Factura", cell: (c) => c.facturaId || "-" },
          { header: "Total", cell: (c) => formatCurrency(c.montoTotal) },
          { header: "Saldo", cell: (c) => formatCurrency(c.saldoPendiente) },
          { header: "Vencimiento", cell: (c) => formatDate(c.fechaVencimiento) },
          { header: "Estado", cell: (c) => (
            <Badge variant={estadoBadge[c.estado] || "default"}>{estadoLabel[c.estado] || c.estado}</Badge>
          )},
          { header: "Acciones", cell: (c) => (
            <div className="flex gap-2">
              <Link href={`/cuentas-cobrar/${c.id}`}>
                <Button variant="outline" size="sm">Ver</Button>
              </Link>
              <Link href={`/cuentas-cobrar/${c.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteCuentaCobrar.bind(null, c.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay cuentas por cobrar"
        emptyDescription="Crea tu primera cuenta por cobrar para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
