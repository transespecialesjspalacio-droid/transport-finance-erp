import { PageHeader } from "@/components/shared/page-header";
import { CostoForm } from "@/features/costos/components/costo-form";
import { getServiciosOptions, getTiposCostoOptions, getTercerosOptions } from "@/features/costos/server/queries";

export default async function NuevoCostoPage() {
  const [servicios, tiposCosto, terceros] = await Promise.all([
    getServiciosOptions(),
    getTiposCostoOptions(),
    getTercerosOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Nuevo costo" description="Registra un nuevo costo operativo" />
      <CostoForm servicios={servicios} tiposCosto={tiposCosto} terceros={terceros} />
    </div>
  );
}
