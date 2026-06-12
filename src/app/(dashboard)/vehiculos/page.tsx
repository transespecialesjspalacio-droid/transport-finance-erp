import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getVehiculos } from "@/features/vehiculos/server/queries";
import { deleteVehiculo } from "@/features/vehiculos/server/actions";

const tipoLabels: Record<string, string> = {
  CAMION: "Camión", CAMIONETA: "Camioneta", TRAILER: "Tráiler",
  VOLQUETE: "Volquete", GRUA: "Grúa", OTRO: "Otro",
};
const propietarioLabels: Record<string, string> = {
  PROPIO: "Propio", TERCERO: "Tercero",
};
const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  DISPONIBLE: "success", EN_SERVICIO: "default",
  EN_MANTENIMIENTO: "warning", FUERA_DE_SERVICIO: "secondary",
};
const estadoLabels: Record<string, string> = {
  DISPONIBLE: "Disponible", EN_SERVICIO: "En servicio",
  EN_MANTENIMIENTO: "En mantenimiento", FUERA_DE_SERVICIO: "Fuera de servicio",
};

export default async function VehiculosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const { data, total, totalPages, currentPage } = await getVehiculos(searchParams);

  return (
    <div>
      <PageHeader title="Vehículos" description="Gestiona tu flotilla de vehículos">
        <Link href="/vehiculos/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo vehículo</Button>
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchInput placeholder="Buscar por placa, marca o modelo..." />
      </div>

      <DataTable
        columns={[
          { header: "Placa", cell: (v) => (
            <Link href={`/vehiculos/${v.id}`} className="font-medium hover:underline">{v.placa}</Link>
          )},
          { header: "Marca", cell: (v) => v.marca },
          { header: "Modelo", cell: (v) => v.modelo },
          { header: "Año", cell: (v) => v.anio },
          { header: "Capacidad", cell: (v) => v.capacidad },
          { header: "Tipo", cell: (v) => tipoLabels[v.tipoVehiculo] },
          { header: "Propietario", cell: (v) => propietarioLabels[v.propietario] },
          { header: "Estado", cell: (v) => (
            <Badge variant={estadoBadge[v.estado]}>{estadoLabels[v.estado]}</Badge>
          )},
          { header: "Acciones", cell: (v) => (
            <div className="flex gap-2">
              <Link href={`/vehiculos/${v.id}/editar`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <form action={deleteVehiculo.bind(null, v.id)}>
                <Button variant="destructive" size="sm" type="submit">Eliminar</Button>
              </form>
            </div>
          )},
        ]}
        data={data}
        emptyTitle="No hay vehículos"
        emptyDescription="Registra un vehículo para comenzar."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
