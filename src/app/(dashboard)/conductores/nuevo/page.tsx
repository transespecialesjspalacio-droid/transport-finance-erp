import { PageHeader } from "@/components/shared/page-header";
import { ConductorForm } from "@/features/conductores/components/conductor-form";

export default function NuevoConductorPage() {
  return (
    <div>
      <PageHeader title="Nuevo conductor" description="Registra un nuevo conductor en el sistema" />
      <ConductorForm />
    </div>
  );
}
