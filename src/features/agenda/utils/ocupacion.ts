export function inicioOcupacion(servicio: {
  fecha: Date;
  horaSalida: Date | null;
}): Date {
  if (servicio.horaSalida) return new Date(servicio.horaSalida);
  const d = new Date(servicio.fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function finOcupacion(servicio: {
  fecha: Date;
  fechaRegreso: Date | null;
  horaRegreso: Date | null;
}): Date {
  if (servicio.fechaRegreso && servicio.horaRegreso) {
    const d = new Date(servicio.horaRegreso);
    d.setFullYear(servicio.fechaRegreso.getFullYear(), servicio.fechaRegreso.getMonth(), servicio.fechaRegreso.getDate());
    return d;
  }
  if (servicio.fechaRegreso) {
    const d = new Date(servicio.fechaRegreso);
    d.setHours(23, 59, 59, 999);
    return d;
  }
  const d = new Date(servicio.fecha);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatOcupacionCompacto(inicio: Date, fin: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const mismoDia = inicio.toDateString() === fin.toDateString();
  if (mismoDia) {
    return `${fmtDate(inicio)} ${fmtTime(inicio)} → ${fmtTime(fin)}`;
  }
  return `${fmtDate(inicio)} ${fmtTime(inicio)} → ${fmtDate(fin)} ${fmtTime(fin)}`;
}

export interface OcupacionRango {
  inicio: Date;
  fin: Date;
  label: string;
}

export function getOcupacionRango(servicio: {
  fecha: Date;
  horaSalida: Date | null;
  fechaRegreso: Date | null;
  horaRegreso: Date | null;
}): OcupacionRango {
  const inicio = inicioOcupacion(servicio);
  const fin = finOcupacion(servicio);
  const label = formatOcupacionCompacto(inicio, fin);
  return { inicio, fin, label };
}
