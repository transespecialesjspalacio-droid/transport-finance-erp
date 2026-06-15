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
const tipoContratoLabels: Record<string, string> = {
  POR_SERVICIOS: "Por servicios", RECURRENTE: "Recurrente", MIXTO: "Mixto",
};
const tipoContratoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  POR_SERVICIOS: "secondary", RECURRENTE: "success", MIXTO: "warning",
};
const periodicidadLabels: Record<string, string> = {
  MENSUAL: "Mensual", QUINCENAL: "Quincenal", SEMANAL: "Semanal", DIARIO: "Diario",
};
const condicionLabels: Record<string, string> = {
  DIAS_30: "30 días", DIAS_60: "60 días", ANTICIPADO: "Anticipado",
};
const categoriaAdjuntoLabels: Record<string, string> = {
  PROGRAMACION: "Programación", FACTURA: "Factura", ACTA: "Acta", SOPORTE: "Soporte", OTRO: "Otro",
};

export default async function ContratoDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const contrato = await getContrato(id);
  if (!contrato) notFound();

  const esRecurrente = contrato.tipoContrato === "RECURRENTE" || contrato.tipoContrato === "MIXTO";

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
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo contrato</span><Badge variant={tipoContratoBadge[contrato.tipoContrato]}>{tipoContratoLabels[contrato.tipoContrato]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo servicio</span><Badge variant="outline">{tipoLabels[contrato.tipoServicio]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Inicio</span><span>{formatDate(contrato.fechaInicio)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fin</span><span>{contrato.fechaFin ? formatDate(contrato.fechaFin) : "Indefinido"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={contrato.active ? "success" : "secondary"}>{contrato.active ? "Vigente" : "Inactivo"}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Condiciones financieras</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Condición de pago</span><span>{condicionLabels[contrato.condicionPago]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monto mensual</span><span className="font-semibold">{contrato.montoMensual ? formatCurrency(contrato.montoMensual) : "Variable"}</span></div>
          </CardContent>
        </Card>
        {esRecurrente && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Recurrencia</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Periodicidad</span><span>{periodicidadLabels[contrato.periodicidad as string] || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valor recurrente</span><span className="font-semibold">{contrato.valorRecurrente ? formatCurrency(contrato.valorRecurrente) : "-"}</span></div>
              {contrato.tipoContrato === "MIXTO" && (
                <div className="flex justify-between"><span className="text-muted-foreground">Rentabilidad base</span><span className="font-semibold">{contrato.rentabilidadBase ? formatCurrency(contrato.rentabilidadBase) : "-"}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Día de corte</span><span>{contrato.diaCorte ?? "1"}</span></div>
            </CardContent>
          </Card>
        )}
      </div>

      {contrato.notas && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Notas</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{contrato.notas}</p></CardContent>
        </Card>
      )}

      {contrato.adjuntos && contrato.adjuntos.length > 0 && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Adjuntos ({contrato.adjuntos.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {contrato.adjuntos.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div>
                    <p className="font-medium">{a.nombre}</p>
                    <p className="text-xs text-muted-foreground">{categoriaAdjuntoLabels[a.categoria] ?? a.categoria}</p>
                  </div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Ver</a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
