import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {(description || trend) && (
              <div className="flex items-center gap-2 pt-1">
                {trend && (
                  <span
                    className={cn(
                      "inline-flex items-center text-xs font-medium",
                      trend === "up" ? "text-success" : "text-destructive"
                    )}
                  >
                    {trend === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {trendValue}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
