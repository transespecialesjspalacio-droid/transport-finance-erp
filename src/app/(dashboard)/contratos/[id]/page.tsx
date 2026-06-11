import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getContrato } from "@/features/contratos/server/queries";
import { deleteContrato } from "@/features/contratos/server/actions";
import { formatDate, formatCurrency } from "@/lib/utils";

const tipoLabels: Record<string, string> = {
  ESCOLAR: "Escolar", CORPORATIVO: "Corporativo", MEDICO: "Médico", EVENTO: "Evento",
};
const condicionLabels: Record<string, string> = {
  DIAS_30: "30 días", DIAS_60: "60 días", ANTICIPADO: "Anticipado",
};

export default async function ContratoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const contrato = await getContrato(id);
  if (!contrato) notFound();

  return (
    <div>
      <PageHeader title={contrato.nombre} description={`Código: ${contrato.codigo}`}>
        <div className="flex gap-2">
          <Link href={`/contratos/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteContrato.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Detalle del contrato</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{contrato.cliente.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><Badge variant="outline">{tipoLabels[contrato.tipoServicio]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Inicio</span><span>{formatDate(contrato.fechaInicio)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fin</span><span>{contrato.fechaFin ? formatDate(contrato.fechaFin) : "Indefinido"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={contrato.active ? "success" : "secondary"}>{contrato.active ? "Vigente" : "Inactivo"}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Condiciones financieras</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Monto mensual</span><span className="font-semibold">{contrato.montoMensual ? formatCurrency(contrato.montoMensual) : "Variable"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Condición de pago</span><span>{condicionLabels[contrato.condicionPago]}</span></div>
          </CardContent>
        </Card>
      </div>

      {contrato.notas && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Notas</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{contrato.notas}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
