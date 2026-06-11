import { PageHeader } from "@/components/shared/page-header";
import { CuentaPagarForm } from "@/features/cuentas-pagar/components/cuenta-pagar-form";
import { getTercerosOptions, getServiciosOptions } from "@/features/cuentas-pagar/server/queries";

export default async function NuevaCuentaPagarPage() {
  const [terceros, servicios] = await Promise.all([
    getTercerosOptions(), getServiciosOptions(),
  ]);

  return (
    <div>
      <PageHeader title="Nueva cuenta por pagar" description="Registra una cuenta por pagar" />
      <CuentaPagarForm terceros={terceros} servicios={servicios} />
    </div>
  );
}
