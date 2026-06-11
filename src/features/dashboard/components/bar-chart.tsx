"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  mes: string;
  ingresos?: number;
  costos?: number;
  utilidad?: number;
}

interface Props {
  data: DataPoint[];
  bars: { key: string; color: string; name: string }[];
  formatValue?: (v: number) => string;
}

function DefaultTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color: string; name: string; value: number }[]; label?: string }) {
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

export function BarChart({ data, bars }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <Tooltip content={<DefaultTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
