"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  nombre: string;
  [key: string]: string | number;
}

interface Props {
  data: DataPoint[];
  valueKey: string;
  color?: string;
  formatValue?: (v: number) => string;
}

function TopTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
      <p className="font-medium">{label}</p>
      <p style={{ color: payload[0].color }}>
        ${Number(payload[0].value).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function HorizontalBarChart({ data, valueKey, color = "hsl(var(--primary))" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
      <RechartsBarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
        <YAxis dataKey="nombre" type="category" tick={{ fontSize: 10 }} className="text-muted-foreground" width={120} />
        <Tooltip content={<TopTooltip />} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
