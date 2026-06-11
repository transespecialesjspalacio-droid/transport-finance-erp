import type { Alerta } from "../flujo-caja";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface Props {
  alertas: Alerta[];
}

const iconMap = {
  DEFICIT: AlertCircle,
  VENCIMIENTO_PROXIMO: AlertTriangle,
  CONCENTRACION: Info,
};

const borderMap = {
  critical: "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800",
  warning: "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800",
  info: "border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800",
};

const iconColorMap = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

export function FlujoCajaAlertas({ alertas }: Props) {
  if (alertas.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertas.map((alerta, idx) => {
        const Icon = iconMap[alerta.tipo];
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-lg border p-4 ${borderMap[alerta.nivel]}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColorMap[alerta.nivel]}`} />
            <div>
              <p className="text-sm font-medium">
                {alerta.tipo === "DEFICIT" && "Déficit Proyectado"}
                {alerta.tipo === "VENCIMIENTO_PROXIMO" && "Vencimientos Próximos"}
                {alerta.tipo === "CONCENTRACION" && "Concentración de Cartera"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{alerta.mensaje}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
