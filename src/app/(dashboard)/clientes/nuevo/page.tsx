import { PageHeader } from "@/components/shared/page-header";
import { ClienteForm } from "@/features/clientes/components/cliente-form";

export default function NuevoClientePage() {
  return (
    <div>
      <PageHeader title="Nuevo cliente" description="Registra un nuevo cliente en el sistema" />
      <ClienteForm />
    </div>
  );
}
