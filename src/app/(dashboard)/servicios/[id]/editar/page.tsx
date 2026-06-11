import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ServicioForm } from "@/features/servicios/components/servicio-form";
import { getServicio, getContratosOptions, getVehiculosOptions, getConductoresOptions } from "@/features/servicios/server/queries";

export default async function EditarServicioPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [servicio, contratos, vehiculos, conductores] = await Promise.all([
    getServicio(id), getContratosOptions(), getVehiculosOptions(), getConductoresOptions(),
  ]);
  if (!servicio) notFound();

  const defaultValues = {
    ...servicio,
    vehiculoId: servicio.vehiculoId ?? "",
    conductorId: servicio.conductorId ?? "",
    fecha: servicio.fecha.toISOString().split("T")[0],
    horaInicio: servicio.horaInicio ? servicio.horaInicio.toISOString().split("T")[1].slice(0, 5) : "",
    horaFin: servicio.horaFin ? servicio.horaFin.toISOString().split("T")[1].slice(0, 5) : "",
    distanciaKm: servicio.distanciaKm?.toString() ?? "",
    kmRecorridos: servicio.kmRecorridos?.toString() ?? "",
    tarifaAplicada: servicio.tarifaAplicada.toString(),
    ingresoEsperado: servicio.ingresoEsperado.toString(),
    ingresoReal: servicio.ingresoReal?.toString() ?? "",
  };

  return (
    <div>
      <PageHeader title="Editar servicio" description={`Servicio del ${servicio.fecha.toLocaleDateString()}`} />
      <ServicioForm defaultValues={defaultValues} contratos={contratos} vehiculos={vehiculos} conductores={conductores} />
    </div>
  );
}
