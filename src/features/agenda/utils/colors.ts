export const estadoCalendario: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PROGRAMADO: { bg: "bg-warning/20", text: "text-warning-foreground", border: "border-l-warning", dot: "bg-warning" },
  EN_CURSO: { bg: "bg-primary/15", text: "text-primary", border: "border-l-primary", dot: "bg-primary" },
  COMPLETADO: { bg: "bg-success/20", text: "text-success-foreground", border: "border-l-success", dot: "bg-success" },
  CANCELADO: { bg: "bg-destructive/15", text: "text-destructive", border: "border-l-destructive", dot: "bg-destructive" },
};
