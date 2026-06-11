import { KpiCard } from "@/components/charts/kpi-card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingDown, Receipt, CreditCard,
  TrendingUp, Wallet, Percent, Bus,
} from "lucide-react";

interface Kpis {
  totalFacturado: number;
  totalCobrado: number;
  totalPorCobrar: number;
  totalPorPagar: number;
  utilidadAcumulada: number;
  cajaProyectada: number;
  margenPromedio: number;
  serviciosDelMes: number;
}

interface Props {
  kpis: Kpis;
  serviciosHoy: { total: number; enCurso: number; programados: number };
}

export function KpiGrid({ kpis, serviciosHoy }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Facturado (Mes)"
        value={formatCurrency(kpis.totalFacturado)}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <KpiCard
        title="Total Cobrado"
        value={formatCurrency(kpis.totalCobrado)}
        icon={<Receipt className="h-5 w-5" />}
      />
      <KpiCard
        title="Total por Cobrar"
        value={formatCurrency(kpis.totalPorCobrar)}
        icon={<CreditCard className="h-5 w-5" />}
        trend={kpis.totalPorCobrar > 0 ? "down" : undefined}
        trendValue={kpis.totalPorCobrar > 0 ? "Pendiente" : "Al día"}
      />
      <KpiCard
        title="Total por Pagar"
        value={formatCurrency(kpis.totalPorPagar)}
        icon={<TrendingDown className="h-5 w-5" />}
        trend={kpis.totalPorPagar > 0 ? "up" : undefined}
        trendValue={kpis.totalPorPagar > 0 ? "Pendiente" : "Al día"}
      />
      <KpiCard
        title="Utilidad Acumulada"
        value={formatCurrency(kpis.utilidadAcumulada)}
        icon={<TrendingUp className="h-5 w-5" />}
        trend={kpis.utilidadAcumulada >= 0 ? "up" : "down"}
      />
      <KpiCard
        title="Caja Proyectada"
        value={formatCurrency(kpis.cajaProyectada)}
        icon={<Wallet className="h-5 w-5" />}
        trend={kpis.cajaProyectada >= 0 ? "up" : "down"}
      />
      <KpiCard
        title="Margen Promedio"
        value={`${(kpis.margenPromedio * 100).toFixed(1)}%`}
        icon={<Percent className="h-5 w-5" />}
        trend={kpis.margenPromedio >= 0.1 ? "up" : "down"}
        trendValue={kpis.margenPromedio >= 0.1 ? "Saludable" : "Bajo"}
      />
      <KpiCard
        title="Servicios del Mes"
        value={String(kpis.serviciosDelMes)}
        description={`Hoy: ${serviciosHoy.total} (${serviciosHoy.enCurso} en curso, ${serviciosHoy.programados} prog.)`}
        icon={<Bus className="h-5 w-5" />}
      />
    </div>
  );
}
