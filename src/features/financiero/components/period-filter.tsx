"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Periodo } from "../flujo-caja";

interface Props {
  current: Periodo;
}

const periods: { value: Periodo; label: string }[] = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "trimestre", label: "Trimestre" },
  { value: "anio", label: "Año" },
];

export function PeriodFilter({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(periodo: Periodo) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", periodo);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={current === p.value ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
