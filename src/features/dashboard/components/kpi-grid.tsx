import { KpiCard } from "@/components/charts/kpi-card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingDown, Receipt, CreditCard,
  TrendingUp, Wallet, Percent, Bus, Repeat, PiggyBank, ChartNoAxesColumn, Landmark, Car,
} from "lucide-react";

interface Flota {
  vehiculosActivos: number;
  vehiculosPropios: number;
  vehiculosTerceros: number;
  utilidadTotalFlota: number;
  vehiculoMasRentable: { placa: string; marca: string; modelo: string; utilidad: number } | null;
  vehiculoMenosRentable: { placa: string; marca: string; modelo: string; utilidad: number } | null;
}

interface Kpis {
  ingresosServicios: number;
  ingresosRecurrentes: number;
  rentabilidadBase: number;
  totalCobrado: number;
  totalPorCobrar: number;
  totalPorPagar: number;
  utilidadReal: number;
  utilidadProyectada: number;
  utilidadEmpresarialReal: number;
  utilidadEmpresarialProyectada: number;
  cajaProyectada: number;
  margenPromedio: number;
  serviciosDelMes: number;
}

interface Props {
  kpis: Kpis;
  serviciosHoy: { total: number; enCurso: number; programados: number };
  flota: Flota;
}

export function KpiGrid({ kpis, serviciosHoy, flota }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ingresos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <KpiCard
            title="Ingresos por Servicios (Mes)"
            value={formatCurrency(kpis.ingresosServicios)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <KpiCard
            title="Ingresos Recurrentes Activos"
            value={formatCurrency(kpis.ingresosRecurrentes)}
            icon={<Repeat className="h-5 w-5" />}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rentabilidad</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Rentabilidad Base Contratos"
            value={formatCurrency(kpis.rentabilidadBase)}
            icon={<PiggyBank className="h-5 w-5" />}
          />
          <KpiCard
            title="Utilidad Real"
            value={formatCurrency(kpis.utilidadReal)}
            icon={<ChartNoAxesColumn className="h-5 w-5" />}
            trend={kpis.utilidadReal >= 0 ? "up" : "down"}
          />
          <KpiCard
            title="Utilidad Proyectada"
            value={formatCurrency(kpis.utilidadProyectada)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={kpis.utilidadProyectada >= 0 ? "up" : "down"}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Utilidad Empresarial</h2>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <KpiCard
            title="Utilidad Empresarial Real"
            value={formatCurrency(kpis.utilidadEmpresarialReal)}
            icon={<Landmark className="h-5 w-5" />}
            trend={kpis.utilidadEmpresarialReal >= 0 ? "up" : "down"}
          />
          <KpiCard
            title="Utilidad Empresarial Proyectada"
            value={formatCurrency(kpis.utilidadEmpresarialProyectada)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={kpis.utilidadEmpresarialProyectada >= 0 ? "up" : "down"}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Flota</h2>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <KpiCard title="Vehículos Activos" value={String(flota.vehiculosActivos)} icon={<Car className="h-5 w-5" />} description={`${flota.vehiculosPropios} propios, ${flota.vehiculosTerceros} terceros`} />
          <KpiCard title="Utilidad Total Flota" value={formatCurrency(flota.utilidadTotalFlota)} icon={<ChartNoAxesColumn className="h-5 w-5" />} trend={flota.utilidadTotalFlota >= 0 ? "up" : "down"} />
          <KpiCard
            title={flota.vehiculoMasRentable ? `Más rentable: ${flota.vehiculoMasRentable.placa}` : "Más rentable"}
            value={flota.vehiculoMasRentable ? formatCurrency(flota.vehiculoMasRentable.utilidad) : "—"}
            icon={<TrendingUp className="h-5 w-5" />}
            description={flota.vehiculoMasRentable ? `${flota.vehiculoMasRentable.marca} ${flota.vehiculoMasRentable.modelo}` : undefined}
          />
        </div>
      </div>

      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  );
}
