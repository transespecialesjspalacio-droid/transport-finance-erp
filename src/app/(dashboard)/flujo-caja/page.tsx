import { PageHeader } from "@/components/shared/page-header";
import { FlujoCajaIndicadores } from "@/features/financiero/components/flujo-caja-indicadores";
import { FlujoCajaTable } from "@/features/financiero/components/flujo-caja-table";
import { FlujoCajaAlertas } from "@/features/financiero/components/flujo-caja-alertas";
import { getFlujoCajaProyectado, type Periodo } from "@/features/financiero/flujo-caja";
import { PeriodFilter } from "@/features/financiero/components/period-filter";

const periodoLabel: Record<Periodo, string> = {
  semana: "Semana",
  mes: "Mes",
  trimestre: "Trimestre",
  anio: "Año",
};

export default async function FlujoCajaPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const periodo = (searchParams.periodo as Periodo) || "mes";

  const { entries, indicadores, alertas } = await getFlujoCajaProyectado(periodo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flujo de Caja Proyectado"
        description={`Proyección para el período actual (${periodoLabel[periodo]})`}
      />

      <PeriodFilter current={periodo} />

<FlujoCajaIndicadores indicadores={indicadores} />

      {alertas.length > 0 && (
        <FlujoCajaAlertas alertas={alertas} />
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Movimientos Proyectados</h2>
        <FlujoCajaTable entries={entries} />
      </div>
    </div>
  );
}
