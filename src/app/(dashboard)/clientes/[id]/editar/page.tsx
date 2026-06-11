import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import { getCliente } from "@/features/clientes/server/queries";

export default async function EditarClientePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  const defaultValues = {
    ...cliente,
    contactoNombre: cliente.contactoNombre ?? undefined,
    contactoEmail: cliente.contactoEmail ?? undefined,
    contactoTelefono: cliente.contactoTelefono ?? undefined,
    direccion: cliente.direccion ?? undefined,
  };

  return (
    <div>
      <PageHeader title="Editar cliente" description={cliente.nombre} />
      <ClienteForm defaultValues={defaultValues} />
    </div>
  );
}
