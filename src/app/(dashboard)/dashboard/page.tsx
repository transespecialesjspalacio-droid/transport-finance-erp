import { getDashboardData } from "@/features/dashboard/server/queries";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { BarChart } from "@/features/dashboard/components/bar-chart";
import { HorizontalBarChart } from "@/features/dashboard/components/horizontal-bar-chart";
import { AreaChart } from "@/features/dashboard/components/area-chart";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import { DashboardAlertas } from "@/features/dashboard/components/dashboard-alertas";
import { ResumenEjecutivo } from "@/features/dashboard/components/resumen-ejecutivo";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const areaData = data.flujoCajaEntries
    .filter((e) => e.fecha)
    .reduce<Record<string, { fecha: string; entradas: number; salidas: number; saldo: number }>>((acc, e) => {
      const key = e.fecha.toISOString().split("T")[0];
      const entry = acc[key] ?? { fecha: key, entradas: 0, salidas: 0, saldo: 0 };
      if (e.tipo === "ENTRADA") entry.entradas += e.valor;
      else entry.salidas += e.valor;
      entry.saldo = entry.entradas - entry.salidas;
      acc[key] = entry;
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estado financiero y operativo de la empresa
        </p>
      </div>

      <KpiGrid kpis={data.kpis} serviciosHoy={data.serviciosHoy} flota={data.flota} />

      <ResumenEjecutivo resumen={data.resumen} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Ingresos por Mes" className="lg:col-span-1">
          <BarChart
            data={data.charts.ingresosCostosPorMes}
            bars={[{ key: "ingresos", color: "hsl(142, 76%, 36%)", name: "Ingresos" }]}
          />
        </ChartCard>
        <ChartCard title="Costos por Mes" className="lg:col-span-1">
          <BarChart
            data={data.charts.ingresosCostosPorMes}
            bars={[{ key: "costos", color: "hsl(0, 84%, 60%)", name: "Costos" }]}
          />
        </ChartCard>
        <ChartCard title="Utilidad por Mes" className="lg:col-span-1">
          <BarChart
            data={data.charts.ingresosCostosPorMes}
            bars={[{ key: "utilidad", color: "hsl(221, 83%, 53%)", name: "Utilidad" }]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Flujo de Caja Proyectado" className="lg:col-span-2">
          <AreaChart
            data={Object.values(areaData)}
            areas={[
              { key: "entradas", color: "hsl(142, 76%, 36%)", name: "Entradas" },
              { key: "salidas", color: "hsl(0, 84%, 60%)", name: "Salidas" },
              { key: "saldo", color: "hsl(221, 83%, 53%)", name: "Saldo" },
            ]}
          />
        </ChartCard>
        <DashboardAlertas
          alertas={data.alertas}
          alertasFlota={data.alertasFlota}
          contratosBajoMargen={data.contratosBajoMargen}
          carteraVencida={data.carteraVencida}
          pagosVencidos={data.pagosVencidos}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Top 10 Clientes por Utilidad">
          <HorizontalBarChart data={data.charts.topClientes} valueKey="utilidad" color="hsl(142, 76%, 36%)" />
        </ChartCard>
        <ChartCard title="Top 10 Contratos por Utilidad">
          <HorizontalBarChart data={data.charts.topContratos.map((c) => ({ ...c, nombre: `${c.nombre} (${c.cliente})` }))} valueKey="utilidad" color="hsl(221, 83%, 53%)" />
        </ChartCard>
        <ChartCard title="Top 10 Terceros por Costo">
          <HorizontalBarChart data={data.charts.topTerceros} valueKey="costo" color="hsl(0, 84%, 60%)" />
        </ChartCard>
      </div>
    </div>
  );
}
