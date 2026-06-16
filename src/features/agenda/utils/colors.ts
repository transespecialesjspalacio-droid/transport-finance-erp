export const estadoCalendario: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PROGRAMADO: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-200", border: "border-l-yellow-400", dot: "bg-yellow-400" },
  EN_CURSO: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-200", border: "border-l-blue-400", dot: "bg-blue-400" },
  COMPLETADO: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-800 dark:text-emerald-200", border: "border-l-emerald-400", dot: "bg-emerald-400" },
  CANCELADO: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-200", border: "border-l-red-400", dot: "bg-red-400" },
};
