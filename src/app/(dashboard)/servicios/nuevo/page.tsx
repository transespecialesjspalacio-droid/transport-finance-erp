import { PageHeader } from "@/components/shared/page-header";
import { ServicioForm } from "@/features/servicios/components/servicio-form";
import { getContratosOptions, getVehiculosOptions, getConductoresOptions } from "@/features/servicios/server/queries";

export default async function NuevoServicioPage() {
  const [contratos, vehiculos, conductores] = await Promise.all([
    getContratosOptions(), getVehiculosOptions(), getConductoresOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Nuevo servicio" description="Registra un servicio de transporte" />
      <ServicioForm contratos={contratos} vehiculos={vehiculos} conductores={conductores} />
    </div>
  );
}
