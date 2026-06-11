import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ContratoForm } from "@/features/contratos/components/contrato-form";
import { getContrato, getClientesOptions } from "@/features/contratos/server/queries";

export default async function EditarContratoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const contrato = await getContrato(id);
  const clientes = await getClientesOptions();
  if (!contrato) notFound();

  return (
    <div>
      <PageHeader title="Editar contrato" description={contrato.nombre} />
      <ContratoForm
        defaultValues={{
          ...contrato,
          fechaInicio: contrato.fechaInicio.toISOString().split("T")[0],
          fechaFin: contrato.fechaFin?.toISOString().split("T")[0] ?? "",
          montoMensual: contrato.montoMensual?.toString() ?? "",
        }}
        clientes={clientes}
      />
    </div>
  );
}
