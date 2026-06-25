import { Badge } from "@/components/ui/badge";

interface AsignacionStatusProps {
  vehiculo: { placa: string } | null;
  conductor: { nombre: string } | null;
}

const statusConfig = {
  COMPLETO: { label: "Completo", variant: "success" as const, dot: "bg-emerald-500" },
  CONDUCTOR_PENDIENTE: { label: "Conductor pendiente", variant: "warning" as const, dot: "bg-amber-500" },
  VEHICULO_PENDIENTE: { label: "Vehículo pendiente", variant: "warning" as const, dot: "bg-amber-500" },
  SIN_ASIGNAR: { label: "Sin asignar", variant: "destructive" as const, dot: "bg-red-500" },
};

export function AsignacionStatus({ vehiculo, conductor }: AsignacionStatusProps) {
  const key = vehiculo && conductor
    ? "COMPLETO"
    : vehiculo
      ? "CONDUCTOR_PENDIENTE"
      : conductor
        ? "VEHICULO_PENDIENTE"
        : "SIN_ASIGNAR";
  const cfg = statusConfig[key];

  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}
