import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaCobrarForm } from "@/features/cuentas-cobrar/components/cuenta-cobrar-form";
import { getCuentaCobrar, getClientesOptions, getContratosOptions, getServiciosOptions } from "@/features/cuentas-cobrar/server/queries";

export default async function EditarCuentaCobrarPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [cuenta, clientes, contratos, servicios] = await Promise.all([
    getCuentaCobrar(id), getClientesOptions(), getContratosOptions(), getServiciosOptions(),
  ]);
  if (!cuenta) notFound();

  const defaultValues = {
    ...cuenta,
    servicioId: cuenta.servicioId ?? "",
    facturaId: cuenta.facturaId ?? "",
    montoTotal: cuenta.montoTotal.toString(),
    fechaEmision: cuenta.fechaEmision.toISOString().split("T")[0],
    fechaVencimiento: cuenta.fechaVencimiento.toISOString().split("T")[0],
  };

  return (
    <div>
      <PageHeader title="Editar cuenta por cobrar" description={`Factura: ${cuenta.facturaId || "Sin factura"}`} />
      <CuentaCobrarForm defaultValues={defaultValues} clientes={clientes} contratos={contratos} servicios={servicios} />
    </div>
  );
}
