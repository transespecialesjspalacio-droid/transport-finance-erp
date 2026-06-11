import { PageHeader } from "@/components/shared/page-header";
import { CuentaCobrarForm } from "@/features/cuentas-cobrar/components/cuenta-cobrar-form";
import { getClientesOptions, getContratosOptions, getServiciosOptions } from "@/features/cuentas-cobrar/server/queries";

export default async function NuevaCuentaCobrarPage() {
  const [clientes, contratos, servicios] = await Promise.all([
    getClientesOptions(), getContratosOptions(), getServiciosOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Nueva cuenta por cobrar" description="Registra una cuenta por cobrar" />
      <CuentaCobrarForm clientes={clientes} contratos={contratos} servicios={servicios} />
    </div>
  );
}
