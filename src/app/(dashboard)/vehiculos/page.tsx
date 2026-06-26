import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { getVehiculos, getAlertasFlota } from "@/features/vehiculos/server/queries";
import { auth } from "@/lib/auth";
import { deleteVehiculo } from "@/features/vehiculos/server/actions";
import { formatDate } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  BUS: "Bus", BUSETON: "Busetón", BUSETA: "Buseta",
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

const tipoAlertaLabels: Record<string, string> = {
  SOAT: "SOAT", TECNOMECANICA: "Tecnomecánica", POLIZA: "Póliza",
};

export default async function VehiculosPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const { data, total, totalPages, currentPage } = await getVehiculos(searchParams);
  const alertasFlota = session?.user?.empresaId ? await getAlertasFlota(session.user.empresaId) : [];

  return (
    <div>
      <PageHeader title="Vehículos" description="Gestiona tu flotilla de vehículos">
        <Link href="/vehiculos/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo vehículo</Button>
        </Link>
      </PageHeader>

      {alertasFlota.length > 0 && (
        <div className="mb-4 space-y-2">
          {alertasFlota.slice(0, 10).map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div className="text-sm">
                <span className="font-medium">{tipoAlertaLabels[a.tipo]}</span> — <Link href={`/vehiculos/${a.vehiculoId}`} className="underline">{a.placa}</Link>
                <span className="text-muted-foreground ml-1">
                  {a.diasRestantes < 0
                    ? `vencido hace ${Math.abs(a.diasRestantes)}d`
                    : `vence en ${a.diasRestantes}d (${formatDate(a.fechaVencimiento)})`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
