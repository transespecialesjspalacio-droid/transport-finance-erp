import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CostoForm } from "@/features/costos/components/costo-form";
import { getCosto, getServiciosOptions, getTiposCostoOptions, getTercerosOptions } from "@/features/costos/server/queries";

export default async function EditarCostoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [costo, servicios, tiposCosto, terceros] = await Promise.all([
    getCosto(id),
    getServiciosOptions(),
    getTiposCostoOptions(),
    getTercerosOptions(),
  ]);
  if (!costo) notFound();

  const defaultValues = {
    id: costo.id,
    servicioId: costo.servicioId,
    tipoCostoId: costo.tipoCostoId,
    terceroId: costo.terceroId ?? "",
    descripcion: costo.descripcion,
    monto: String(costo.monto),
    cantidad: String(costo.cantidad),
    fecha: costo.fecha.toISOString().split("T")[0],
  };

  return (
    <div>
      <PageHeader title="Editar costo" description={costo.descripcion} />
      <CostoForm defaultValues={defaultValues} servicios={servicios} tiposCosto={tiposCosto} terceros={terceros} />
    </div>
  );
}
