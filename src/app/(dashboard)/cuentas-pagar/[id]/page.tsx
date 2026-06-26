import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCuentaPagar } from "@/features/cuentas-pagar/server/queries";
import { deleteCuentaPagar, registerPago } from "@/features/cuentas-pagar/server/actions";
import { PagoForm } from "@/features/cuentas-pagar/components/pago-form";

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

export default async function CuentaPagarDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const cuenta = await getCuentaPagar(id);
  if (!cuenta) notFound();

  return (
    <div>
      <PageHeader title="Cuenta por pagar" description={cuenta.tercero.nombre}>
        <div className="flex gap-2">
          <Link href={`/cuentas-pagar/${id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteCuentaPagar.bind(null, id)}>
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Información general</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tercero</span><span className="font-medium">{cuenta.tercero.nombre}</span></div>
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
          <CardHeader><CardTitle className="text-sm">Registrar pago</CardTitle></CardHeader>
          <CardContent>
            <PagoForm cuentaPagarId={id} action={registerPago} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Historial de pagos</CardTitle></CardHeader>
        <CardContent>
          {cuenta.pagos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se han registrado pagos.</p>
          ) : (
            <div className="space-y-2">
              {cuenta.pagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <span className="font-medium">{formatDate(pago.fechaPago)}</span>
                    <span className="mx-2 text-muted-foreground">—</span>
                    <span>{pago.metodoPago}</span>
                    {pago.referencia && <span className="ml-2 text-muted-foreground">Ref: {pago.referencia}</span>}
                  </div>
                  <span className="font-medium text-destructive">{formatCurrency(pago.monto)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
