import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaPagarForm } from "@/features/cuentas-pagar/components/cuenta-pagar-form";
import { getCuentaPagar, getTercerosOptions, getServiciosOptions } from "@/features/cuentas-pagar/server/queries";

export default async function EditarCuentaPagarPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [cuenta, terceros, servicios] = await Promise.all([
    getCuentaPagar(id), getTercerosOptions(), getServiciosOptions(),
  ]);
  if (!cuenta) notFound();

  const defaultValues = {
    ...cuenta,
    servicioId: cuenta.servicioId ?? "",
    montoTotal: cuenta.montoTotal.toString(),
    fechaEmision: cuenta.fechaEmision.toISOString().split("T")[0],
    fechaVencimiento: cuenta.fechaVencimiento.toISOString().split("T")[0],
  };

  return (
    <div>
      <PageHeader title="Editar cuenta por pagar" description={cuenta.tercero.nombre} />
      <CuentaPagarForm defaultValues={defaultValues} terceros={terceros} servicios={servicios} />
    </div>
  );
}
