"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  fecha: string;
  entradas?: number;
  salidas?: number;
  saldo?: number;
}

interface Props {
  data: DataPoint[];
  areas: { key: string; color: string; name: string }[];
}

function AreaTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ${Number(p.value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export function AreaChart({ data, areas }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="fecha" tick={{ fontSize: 10 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
        <Tooltip content={<AreaTooltip />} />
        {areas.map((area) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            stroke={area.color}
            fill={area.color}
            fillOpacity={0.1}
            name={area.name}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
