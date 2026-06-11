import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, TrendingDown } from "lucide-react";
import type { Alerta } from "@/features/financiero/flujo-caja";

interface Props {
  alertas: Alerta[];
  contratosBajoMargen: number;
  carteraVencida: number;
  pagosVencidos: number;
}

export function DashboardAlertas({ alertas, contratosBajoMargen, carteraVencida, pagosVencidos }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {carteraVencida > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium">Facturas Vencidas</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(carteraVencida)} en cuentas vencidas</p>
            </div>
          </div>
        )}
        {pagosVencidos > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
            <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Pagos Vencidos</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(pagosVencidos)} en pagos pendientes vencidos</p>
            </div>
          </div>
        )}
        {contratosBajoMargen > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Contratos con Margen &lt; 10%</p>
              <p className="text-sm text-muted-foreground">{contratosBajoMargen} contrato(s) con margen por debajo del umbral</p>
            </div>
          </div>
        )}
        {alertas.map((alerta, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              alerta.nivel === "critical"
                ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                : alerta.nivel === "warning"
                ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                : "border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800"
            }`}
          >
            {alerta.nivel === "critical" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            ) : alerta.nivel === "warning" ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            )}
            <div>
              <p className="text-sm font-medium">
                {alerta.tipo === "DEFICIT" && "Déficit de Caja Proyectado"}
                {alerta.tipo === "VENCIMIENTO_PROXIMO" && "Vencimientos Próximos"}
                {alerta.tipo === "CONCENTRACION" && "Concentración de Cartera"}
              </p>
              <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
            </div>
          </div>
        ))}
        {carteraVencida === 0 && pagosVencidos === 0 && contratosBajoMargen === 0 && alertas.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay alertas activas</p>
        )}
      </CardContent>
    </Card>
  );
}
