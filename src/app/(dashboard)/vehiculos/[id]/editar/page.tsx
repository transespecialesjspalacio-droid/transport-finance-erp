import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehiculoForm } from "@/features/vehiculos/components/vehiculo-form";
import { getVehiculo } from "@/features/vehiculos/server/queries";

export default async function EditarVehiculoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vehiculo = await getVehiculo(id);
  if (!vehiculo) notFound();

  const defaultValues = {
    ...vehiculo,
    anio: vehiculo.anio.toString(),
    capacidad: vehiculo.capacidad.toString(),
  };

  return (
    <div>
      <PageHeader title="Editar vehículo" description={`${vehiculo.placa} — ${vehiculo.marca} ${vehiculo.modelo}`} />
      <VehiculoForm defaultValues={defaultValues} />
    </div>
  );
}
