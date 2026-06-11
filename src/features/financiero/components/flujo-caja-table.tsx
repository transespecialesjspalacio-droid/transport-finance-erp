"use client";

import type { FlujoCajaEntry } from "../flujo-caja";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  entries: FlujoCajaEntry[];
}

export function FlujoCajaTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No hay movimientos proyectados en este período.
      </div>
    );
  }

  let acumulado = 0;

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Concepto</th>
              <th className="px-4 py-3 text-left font-medium">Origen</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-right font-medium">Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              acumulado += entry.tipo === "ENTRADA" ? entry.valor : -entry.valor;
              return (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(entry.fecha)}</td>
                  <td className="px-4 py-3">{entry.concepto}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.origen}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.tipo === "ENTRADA"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {entry.tipo === "ENTRADA" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      entry.tipo === "ENTRADA" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {entry.tipo === "ENTRADA" ? "+" : "-"}
                    {formatCurrency(entry.valor)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      acumulado >= 0 ? "text-foreground" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(acumulado)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
