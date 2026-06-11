import { PageHeader } from "@/components/shared/page-header";
import { ContratoForm } from "@/features/contratos/components/contrato-form";
import { getClientesOptions } from "@/features/contratos/server/queries";

export default async function NuevoContratoPage() {
  const clientes = await getClientesOptions();
  return (
    <div>
      <PageHeader title="Nuevo contrato" description="Registra un nuevo contrato" />
      <ContratoForm clientes={clientes} />
    </div>
  );
}
