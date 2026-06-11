import { PageHeader } from "@/components/shared/page-header";
import { TerceroForm } from "@/features/terceros/components/tercero-form";

export default function NuevoTerceroPage() {
  return (
    <div>
      <PageHeader title="Nuevo tercero" description="Registra un transportador, proveedor u otro tercero" />
      <TerceroForm />
    </div>
  );
}
