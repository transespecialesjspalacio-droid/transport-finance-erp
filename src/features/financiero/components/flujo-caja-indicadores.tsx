import type { FlujoCajaIndicadores } from "../flujo-caja";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  indicadores: FlujoCajaIndicadores;
}

export function FlujoCajaIndicadores({ indicadores }: Props) {
  const cards = [
    {
      title: "Entradas Esperadas",
      value: formatCurrency(indicadores.entradasEsperadas),
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-success",
      bg: "bg-success/15",
    },
    {
      title: "Salidas Esperadas",
      value: formatCurrency(indicadores.salidasEsperadas),
      icon: <TrendingDown className="h-5 w-5" />,
      color: "text-destructive",
      bg: "bg-destructive/15",
    },
    {
      title: "Saldo Proyectado",
      value: formatCurrency(indicadores.saldoProyectado),
      icon: <DollarSign className="h-5 w-5" />,
      color: indicadores.saldoProyectado >= 0 ? "text-success" : "text-destructive",
      bg: "bg-primary/10",
    },
    {
      title: "Caja Neta Proyectada",
      value: formatCurrency(indicadores.cajaNetaProyectada),
      icon: <Wallet className="h-5 w-5" />,
      color: indicadores.cajaNetaProyectada >= 0 ? "text-success" : "text-destructive",
      bg: "bg-accent/15",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-lg border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <div className={`rounded-lg p-2 ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
