import Link from "next/link";
import { ArrowRight, Calendar, TrendingUp, TrendingDown, AlertTriangle, Car, Users } from "lucide-react";
import { getDashboardData } from "@/features/dashboard/server/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/charts/kpi-card";
import { formatCurrency } from "@/lib/utils";

function PorcentajeCambio({ valor }: { valor: number | null }) {
  if (valor === null) return null;
  const positivo = valor >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${positivo ? "text-emerald-600" : "text-red-600"}`}>
      {positivo ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {positivo ? "+" : ""}{valor.toFixed(1)}%
    </span>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { bloque1, bloque2, bloque3, bloque4 } = data;

  return (
    <div className="space-y-10">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Estado general de la empresa</p>
      </div>

      {/* BLOQUE 1 — Operación de Hoy */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">¿Qué tengo que hacer hoy?</h2>
            <p className="text-sm text-muted-foreground">Resumen operativo del día</p>
          </div>
          <Link href="/agenda">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Ir a Agenda
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          <KpiCard title="Servicios hoy" value={String(bloque1.total)} icon={<Calendar className="h-5 w-5" />} />
          <KpiCard title="Pendientes" value={String(bloque1.programados)} icon={<Calendar className="h-5 w-5" />} className="border-amber-200" />
          <KpiCard title="En curso" value={String(bloque1.enCurso)} icon={<TrendingUp className="h-5 w-5" />} className="border-blue-200" />
          <KpiCard title="Completados" value={String(bloque1.completados)} icon={<TrendingUp className="h-5 w-5" />} className="border-emerald-200" />
          <KpiCard title="Cancelados" value={String(bloque1.cancelados)} icon={<TrendingDown className="h-5 w-5" />} className="border-red-200" />
        </div>
      </section>

      {/* BLOQUE 2 — Estado del Negocio (Mes) */}
      <section>
        <h2 className="text-lg font-semibold mb-1">¿Cómo va económicamente este mes?</h2>
        <p className="text-sm text-muted-foreground mb-4">Indicadores financieros del período</p>

        <div className="grid gap-4 md:grid-cols-5 mb-4">
          <KpiCard title="Ingresos" value={formatCurrency(bloque2.ingresos)} />
          <KpiCard title="Por cobrar" value={formatCurrency(bloque2.porCobrar)} trend={bloque2.porCobrar > 0 ? "down" : undefined} trendValue={bloque2.porCobrar > 0 ? "Pendiente" : "Al día"} />
          <KpiCard title="Por pagar" value={formatCurrency(bloque2.porPagar)} trend={bloque2.porPagar > 0 ? "up" : undefined} trendValue={bloque2.porPagar > 0 ? "Pendiente" : "Al día"} />
          <KpiCard title="Caja proyectada" value={formatCurrency(bloque2.cajaProyectada)} trend={bloque2.cajaProyectada >= 0 ? "up" : "down"} />
          <KpiCard title="Ganancia proyectada" value={formatCurrency(bloque2.gananciaProyectada)} trend={bloque2.gananciaProyectada >= 0 ? "up" : "down"} />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancia proyectada</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(bloque2.gananciaProyectada)}</p>
              </div>
              <div className="text-right">
                <PorcentajeCambio valor={bloque2.porcentajeCambio} />
                {bloque2.porcentajeCambio !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    vs mes anterior ({formatCurrency(bloque2.gananciaMesAnterior)})
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* BLOQUE 3 — Estado del Negocio (Año) */}
      <section>
        <h2 className="text-lg font-semibold mb-1">¿Cómo va el año?</h2>
        <p className="text-sm text-muted-foreground mb-4">Acumulado anual</p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos acumulados</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(bloque3.ingresos)}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <PorcentajeCambio valor={bloque3.porcentajeCambioIngresos} />
                    {bloque3.porcentajeCambioIngresos !== null && (
                      <span className="text-xs text-muted-foreground">vs año anterior</span>
                    )}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ganancia acumulada</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(bloque3.ganancia)}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <PorcentajeCambio valor={bloque3.porcentajeCambioGanancia} />
                    {bloque3.porcentajeCambioGanancia !== null && (
                      <span className="text-xs text-muted-foreground">vs año anterior</span>
                    )}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BLOQUE 4 — Requiere Atención */}
      <section>
        <h2 className="text-lg font-semibold mb-1">¿Qué requiere mi atención?</h2>
        <p className="text-sm text-muted-foreground mb-4">Elementos que necesitan acción inmediata</p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                  <Car className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servicios sin vehículo</p>
                  <p className="text-2xl font-bold">{bloque4.serviciosSinVehiculo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servicios sin conductor</p>
                  <p className="text-2xl font-bold">{bloque4.serviciosSinConductor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {bloque4.carteraVencida > 0 && (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cuentas por cobrar vencidas</p>
                    <p className="text-2xl font-bold">{formatCurrency(bloque4.carteraVencida)}</p>
                    <Link href="/cuentas-cobrar" className="text-xs text-primary underline mt-1 inline-block">
                      Ver cuentas
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {bloque4.alertasFlota.map((a, i) => (
            <Card key={i} className="border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                    <Car className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {a.tipo === "SOAT" ? "SOAT" : a.tipo === "TECNOMECANICA" ? "Tecnomecánica" : "Póliza"} — {a.placa}
                    </p>
                    <p className={`text-2xl font-bold ${a.diasRestantes < 0 ? "text-red-600" : ""}`}>
                      {a.diasRestantes < 0 ? `Vencido ${Math.abs(a.diasRestantes)} días` : `${a.diasRestantes} días`}
                    </p>
                    <Link href={`/vehiculos/${a.vehiculoId}`} className="text-xs text-primary underline mt-1 inline-block">
                      Ver vehículo
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {bloque4.carteraVencida <= 0 && bloque4.alertasFlota.length === 0 && bloque4.serviciosSinVehiculo === 0 && bloque4.serviciosSinConductor === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium text-emerald-600">Todo en orden</p>
                <p className="text-sm text-muted-foreground">No hay elementos que requieran atención inmediata</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
