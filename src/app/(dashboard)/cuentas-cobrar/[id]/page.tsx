import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCuentaCobrar } from "@/features/cuentas-cobrar/server/queries";
import { deleteCuentaCobrar, registerCobro } from "@/features/cuentas-cobrar/server/actions";
import { CobroForm } from "@/features/cuentas-cobrar/components/cobro-form";

const estadoBadge: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDIENTE: "warning",
  PARCIAL: "secondary",
  PAGADO: "success",
  VENCIDO: "destructive",
};

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
};

export default async function CuentaCobrarDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const cuenta = await getCuentaCobrar(id);
  if (!cuenta) notFound();

  return (
    <div>
      <PageHeader title={`Cuenta por cobrar`} description={`Factura: ${cuenta.facturaId || "Sin factura"}`}>
        <div className="flex gap-2">
          <Link href={`/cuentas-cobrar/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteCuentaCobrar.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{cuenta.cliente.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contrato</span><span>{cuenta.contrato.codigo} — {cuenta.contrato.nombre}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Factura</span><span>{cuenta.facturaId || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={estadoBadge[cuenta.estado] || "default"}>{estadoLabel[cuenta.estado] || cuenta.estado}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Montos</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Valor total</span><span className="font-medium">{formatCurrency(cuenta.montoTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Saldo pendiente</span><span className="font-medium">{formatCurrency(cuenta.saldoPendiente)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Emitido</span><span>{formatDate(cuenta.fechaEmision)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vence</span><span>{formatDate(cuenta.fechaVencimiento)}</span></div>
          </CardContent>
        </Card>
      </div>

      {Number(cuenta.saldoPendiente) > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">Registrar cobro</CardTitle></CardHeader>
          <CardContent>
            <CobroForm cuentaCobrarId={id} action={registerCobro} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Historial de cobros</CardTitle></CardHeader>
        <CardContent>
          {cuenta.cobros.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se han registrado cobros.</p>
          ) : (
            <div className="space-y-2">
              {cuenta.cobros.map((cobro) => (
                <div key={cobro.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <span className="font-medium">{formatDate(cobro.fechaPago)}</span>
                    <span className="mx-2 text-muted-foreground">—</span>
                    <span>{cobro.metodoPago}</span>
                    {cobro.referencia && <span className="ml-2 text-muted-foreground">Ref: {cobro.referencia}</span>}
                  </div>
                  <span className="font-medium text-success">{formatCurrency(cobro.monto)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
