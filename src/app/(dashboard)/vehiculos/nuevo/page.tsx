import { PageHeader } from "@/components/shared/page-header";
import { VehiculoForm } from "@/features/vehiculos/components/vehiculo-form";

export default function NuevoVehiculoPage() {
  return (
    <div>
      <PageHeader title="Nuevo vehículo" description="Registra un nuevo vehículo en el sistema" />
      <VehiculoForm />
    </div>
  );
}
