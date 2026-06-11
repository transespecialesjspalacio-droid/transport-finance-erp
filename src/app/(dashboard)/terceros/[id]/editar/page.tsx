import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { TerceroForm } from "@/features/terceros/components/tercero-form";
import { getTercero } from "@/features/terceros/server/queries";

export default async function EditarTerceroPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const tercero = await getTercero(id);
  if (!tercero) notFound();

  const defaultValues = {
    ...tercero,
    codigo: tercero.codigo ?? undefined,
    rfc: tercero.rfc ?? undefined,
    contacto: tercero.contacto ?? undefined,
  };

  return (
    <div>
      <PageHeader title="Editar tercero" description={tercero.nombre} />
      <TerceroForm defaultValues={defaultValues} />
    </div>
  );
}
