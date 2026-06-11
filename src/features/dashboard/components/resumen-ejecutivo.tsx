import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Award, Trophy, Star, DollarSign } from "lucide-react";

interface Resumen {
  clienteMasRentable: { nombre: string; utilidad: number } | null;
  contratoMasRentable: { nombre: string; cliente: string; utilidad: number } | null;
  servicioMasRentable: { nombre: string; contrato: string; cliente: string; utilidad: number } | null;
  terceroMayorCosto: { nombre: string; costo: number } | null;
}

interface Props {
  resumen: Resumen;
}

export function ResumenEjecutivo({ resumen }: Props) {
  const items = [
    {
      icon: <Award className="h-5 w-5 text-amber-500" />,
      label: "Cliente más rentable",
      primary: resumen.clienteMasRentable?.nombre ?? "Sin datos",
      secondary: resumen.clienteMasRentable ? formatCurrency(resumen.clienteMasRentable.utilidad) : "",
    },
    {
      icon: <Trophy className="h-5 w-5 text-blue-500" />,
      label: "Contrato más rentable",
      primary: resumen.contratoMasRentable?.nombre ?? "Sin datos",
      secondary: resumen.contratoMasRentable
        ? `${resumen.contratoMasRentable.cliente} — ${formatCurrency(resumen.contratoMasRentable.utilidad)}`
        : "",
    },
    {
      icon: <Star className="h-5 w-5 text-emerald-500" />,
      label: "Servicio más rentable",
      primary: resumen.servicioMasRentable?.nombre ?? "Sin datos",
      secondary: resumen.servicioMasRentable
        ? `${resumen.servicioMasRentable.cliente} — ${formatCurrency(resumen.servicioMasRentable.utilidad)}`
        : "",
    },
    {
      icon: <DollarSign className="h-5 w-5 text-red-500" />,
      label: "Tercero con mayor costo",
      primary: resumen.terceroMayorCosto?.nombre ?? "Sin datos",
      secondary: resumen.terceroMayorCosto ? formatCurrency(resumen.terceroMayorCosto.costo) : "",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Resumen Ejecutivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="mt-0.5">{item.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium truncate">{item.primary}</p>
                {item.secondary && (
                  <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
