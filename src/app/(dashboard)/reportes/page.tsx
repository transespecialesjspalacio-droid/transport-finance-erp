import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  getReporteServicios, getReporteClientes, getReporteContratos,
  getReporteCuentasCobrar, getReporteCuentasPagar, getReporteRentabilidad,
  getReporteContratosRecurrentes, getReporteComparativoRealVsProyectado,
  getReporteRentabilidadContratos,
} from "@/features/reportes/server/queries";
import { getRentabilidadVehiculos } from "@/features/vehiculos/server/queries";

const estadoBadge: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  PENDIENTE: "warning", PARCIAL: "default", PAGADO: "success", VENCIDO: "destructive",
  PROGRAMADO: "warning", EN_CURSO: "default", COMPLETADO: "success", CANCELADO: "secondary",
};

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente", PARCIAL: "Parcial", PAGADO: "Pagado", VENCIDO: "Vencido",
  PROGRAMADO: "Programado", EN_CURSO: "En curso", COMPLETADO: "Completado", CANCELADO: "Cancelado",
};

const tipoContratoLabels: Record<string, string> = {
  POR_SERVICIOS: "Por servicios", RECURRENTE: "Recurrente", MIXTO: "Mixto",
};

const tipoContratoBadge: Record<string, "default" | "success" | "warning" | "secondary"> = {
  POR_SERVICIOS: "secondary", RECURRENTE: "success", MIXTO: "warning",
};

export default async function ReportesPage() {
  const session = await auth();
  if (!session?.user?.empresaId) redirect("/login");
  const empresaId = session.user.empresaId;

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
  const inicioAnio = new Date(ahora.getFullYear(), 0, 1);

  const [servicios, clientes, contratos, cuentasCobrar, cuentasPagar, rentabilidad, contratosRecurrentes, comparativo, topContratos, topVehiculos] = await Promise.all([
    getReporteServicios(empresaId, inicioMes, finMes),
    getReporteClientes(empresaId),
    getReporteContratos(empresaId),
    getReporteCuentasCobrar(empresaId),
    getReporteCuentasPagar(empresaId),
    getReporteRentabilidad(empresaId, inicioAnio, finMes),
    getReporteContratosRecurrentes(empresaId),
    getReporteComparativoRealVsProyectado(empresaId),
    getReporteRentabilidadContratos(empresaId),
    getRentabilidadVehiculos(empresaId),
  ]);

  return (
    <div>
      <PageHeader title="Reportes" description="Indicadores y reportes del negocio" />

      {/* Table of Contents */}
      <nav className="mb-6 flex flex-wrap gap-2">
        {[
          { id: "servicios", label: "Servicios" },
          { id: "clientes", label: "Clientes" },
          { id: "contratos", label: "Contratos" },
          { id: "cxc", label: "CxC" },
          { id: "cxp", label: "CxP" },
          { id: "rentabilidad", label: "Rentabilidad" },
          { id: "rentabilidad-contractual", label: "Rent. Contractual" },
          { id: "real-vs-proyectado", label: "Real vs Proyectado" },
          { id: "top-contratos", label: "Top Contratos" },
          { id: "top-vehiculos", label: "Top Vehículos" },
        ].map((item) => (
          <a key={item.id} href={`#${item.id}`}
            className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
            {item.label}
          </a>
        ))}
      </nav>

      {/* Reporte de Servicios */}
      <section id="servicios" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Servicios</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Código</th>
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Origen</th>
                    <th className="py-2 pr-4">Destino</th>
                    <th className="py-2 pr-4">Vehículo</th>
                    <th className="py-2 pr-4">Conductor</th>
                    <th className="py-2 pr-4">Ingreso</th>
                    <th className="py-2 pr-4">Costos</th>
                    <th className="py-2 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 pr-4">{s.codigo || "-"}</td>
                      <td className="py-2 pr-4">{formatDate(s.fecha)}</td>
                      <td className="py-2 pr-4">{s.cliente}</td>
                      <td className="py-2 pr-4">{s.contrato}</td>
                      <td className="py-2 pr-4">{s.origen || "-"}</td>
                      <td className="py-2 pr-4">{s.destino || "-"}</td>
                      <td className="py-2 pr-4">{s.vehiculo || "-"}</td>
                      <td className="py-2 pr-4">{s.conductor || "-"}</td>
                      <td className="py-2 pr-4">{formatCurrency(s.ingresoEsperado)}</td>
                      <td className="py-2 pr-4">{formatCurrency(s.costos)}</td>
                      <td className="py-2 pr-4"><Badge variant={estadoBadge[s.estado] ?? "default"}>{estadoLabels[s.estado] || s.estado}</Badge></td>
                    </tr>
                  ))}
                  {servicios.length === 0 && (
                    <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">No hay servicios en el período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de Clientes */}
      <section id="clientes" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Clientes</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">RFC</th>
                    <th className="py-2 pr-4">Contratos activos</th>
                    <th className="py-2 pr-4">Saldo pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{c.nombre}</td>
                      <td className="py-2 pr-4">{c.rfc || "-"}</td>
                      <td className="py-2 pr-4">{c.contratos}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.saldoPendiente)}</td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No hay clientes activos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de Contratos */}
      <section id="contratos" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Contratos</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Código</th>
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Tipo contrato</th>
                    <th className="py-2 pr-4">Tipo servicio</th>
                    <th className="py-2 pr-4">Servicios</th>
                    <th className="py-2 pr-4">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4">{c.codigo}</td>
                      <td className="py-2 pr-4 font-medium">{c.nombre}</td>
                      <td className="py-2 pr-4">{c.cliente}</td>
                      <td className="py-2 pr-4"><Badge variant={tipoContratoBadge[c.tipoContrato]}>{tipoContratoLabels[c.tipoContrato]}</Badge></td>
                      <td className="py-2 pr-4">{c.tipoServicio}</td>
                      <td className="py-2 pr-4">{c.servicios}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.ingresos)}</td>
                    </tr>
                  ))}
                  {contratos.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay contratos activos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de CxC */}
      <section id="cxc" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Cuentas por Cobrar</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Factura</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Monto</th>
                    <th className="py-2 pr-4">Saldo</th>
                    <th className="py-2 pr-4">Vencimiento</th>
                    <th className="py-2 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasCobrar.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4">{c.facturaId || "-"}</td>
                      <td className="py-2 pr-4">{c.cliente}</td>
                      <td className="py-2 pr-4">{c.contrato}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.montoTotal)}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.saldoPendiente)}</td>
                      <td className="py-2 pr-4">{formatDate(c.fechaVencimiento)}</td>
                      <td className="py-2 pr-4"><Badge variant={estadoBadge[c.estado]}>{estadoLabels[c.estado]}</Badge></td>
                    </tr>
                  ))}
                  {cuentasCobrar.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay cuentas por cobrar</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de CxP */}
      <section id="cxp" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Cuentas por Pagar</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Número</th>
                    <th className="py-2 pr-4">Proveedor</th>
                    <th className="py-2 pr-4">Monto</th>
                    <th className="py-2 pr-4">Saldo</th>
                    <th className="py-2 pr-4">Vencimiento</th>
                    <th className="py-2 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasPagar.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4">{c.numero || "-"}</td>
                      <td className="py-2 pr-4">{c.tercero}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.montoTotal)}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.saldoPendiente)}</td>
                      <td className="py-2 pr-4">{formatDate(c.fechaVencimiento)}</td>
                      <td className="py-2 pr-4"><Badge variant={estadoBadge[c.estado]}>{estadoLabels[c.estado]}</Badge></td>
                    </tr>
                  ))}
                  {cuentasPagar.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay cuentas por pagar</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de Rentabilidad */}
      <section id="rentabilidad" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Reporte de Rentabilidad</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Ingresos totales</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(rentabilidad.totales.ingresos)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Costos totales</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(rentabilidad.totales.costos)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Utilidad neta</p>
                <p className={`text-xl font-bold ${rentabilidad.totales.utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(rentabilidad.totales.utilidad)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Ingreso</th>
                    <th className="py-2 pr-4">Costos</th>
                    <th className="py-2 pr-4">Utilidad</th>
                    <th className="py-2 pr-4">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {rentabilidad.servicios.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 pr-4">{formatDate(s.fecha)}</td>
                      <td className="py-2 pr-4">{s.cliente}</td>
                      <td className="py-2 pr-4">{s.contrato}</td>
                      <td className="py-2 pr-4">{formatCurrency(s.ingreso)}</td>
                      <td className="py-2 pr-4">{formatCurrency(s.costos)}</td>
                      <td className={`py-2 pr-4 ${s.utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(s.utilidad)}</td>
                      <td className="py-2 pr-4">{s.margen.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {rentabilidad.servicios.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay servicios completados en el período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de Comparativo Real vs Proyectado */}
      <section id="real-vs-proyectado" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Comparativo Real vs Proyectado</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Utilidad Real</th>
                    <th className="py-2 pr-4">Utilidad Proyectada</th>
                    <th className="py-2 pr-4">Diferencia</th>
                    <th className="py-2 pr-4">% Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativo.map((c) => (
                    <tr key={c.contratoId} className="border-b">
                      <td className="py-2 pr-4 font-medium">{c.contrato}</td>
                      <td className="py-2 pr-4">{c.cliente}</td>
                      <td className="py-2 pr-4 text-emerald-600">{formatCurrency(c.utilidadReal)}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.utilidadProyectada)}</td>
                      <td className={`py-2 pr-4 ${c.diferencia >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(c.diferencia)}</td>
                      <td className="py-2 pr-4">{c.cumplimiento.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {comparativo.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay contratos activos para comparar</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reporte de Rentabilidad Contractual */}
      <section id="rentabilidad-contractual" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Rentabilidad Contractual</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Valor recurrente</th>
                    <th className="py-2 pr-4">Rentabilidad base</th>
                    <th className="py-2 pr-4">Ingreso mensual total</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Vigencia</th>
                  </tr>
                </thead>
                <tbody>
                  {contratosRecurrentes.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{c.cliente}</td>
                      <td className="py-2 pr-4">{c.nombre}</td>
                      <td className="py-2 pr-4"><Badge variant={tipoContratoBadge[c.tipoContrato]}>{tipoContratoLabels[c.tipoContrato]}</Badge></td>
                      <td className="py-2 pr-4">{formatCurrency(c.valorRecurrente)}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.rentabilidadBase)}</td>
                      <td className="py-2 pr-4 font-semibold">{formatCurrency(c.ingresoMensualTotal)}</td>
                      <td className="py-2 pr-4"><Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Vigente" : "Inactivo"}</Badge></td>
                      <td className="py-2 pr-4">{formatDate(c.fechaInicio)} - {c.fechaFin ? formatDate(c.fechaFin) : "Indefinido"}</td>
                    </tr>
                  ))}
                  {contratosRecurrentes.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No hay contratos recurrentes registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top Contratos Rentables */}
      <section id="top-contratos" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Top Contratos Rentables</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Contrato</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Ingresos</th>
                    <th className="py-2 pr-4">Costos</th>
                    <th className="py-2 pr-4">Utilidad</th>
                    <th className="py-2 pr-4">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {topContratos.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{c.contrato}</td>
                      <td className="py-2 pr-4">{c.cliente}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.ingresosRecurrentes + c.ingresosServicios)}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.costos)}</td>
                      <td className={`py-2 pr-4 ${c.utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(c.utilidad)}</td>
                      <td className="py-2 pr-4">{c.margen.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {topContratos.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay contratos activos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top Vehículos Rentables */}
      <section id="top-vehiculos" className="mb-8">
        <Card>
          <CardHeader><CardTitle>Top Vehículos Rentables</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Vehículo</th>
                    <th className="py-2 pr-4">Placa</th>
                    <th className="py-2 pr-4">Ingresos</th>
                    <th className="py-2 pr-4">Costos</th>
                    <th className="py-2 pr-4">Utilidad</th>
                    <th className="py-2 pr-4">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {topVehiculos.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{v.marca} {v.modelo}</td>
                      <td className="py-2 pr-4">{v.placa}</td>
                      <td className="py-2 pr-4">{formatCurrency(v.ingresos)}</td>
                      <td className="py-2 pr-4">{formatCurrency(v.costos)}</td>
                      <td className={`py-2 pr-4 ${v.utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(v.utilidad)}</td>
                      <td className="py-2 pr-4">{v.margen.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {topVehiculos.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay vehículos registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
