import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ConductorForm } from "@/features/conductores/components/conductor-form";
import { getConductor } from "@/features/conductores/server/queries";

export default async function EditarConductorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const conductor = await getConductor(id);
  if (!conductor) notFound();

  const defaultValues = {
    ...conductor,
    documento: conductor.documento ?? "",
    categoria: conductor.categoria ?? "",
    telefono: conductor.telefono ?? "",
    fechaVencimiento: conductor.fechaVencimiento
      ? conductor.fechaVencimiento.toISOString().split("T")[0]
      : "",
  };

  return (
    <div>
      <PageHeader title="Editar conductor" description={conductor.nombre} />
      <ConductorForm defaultValues={defaultValues} />
    </div>
  );
}
