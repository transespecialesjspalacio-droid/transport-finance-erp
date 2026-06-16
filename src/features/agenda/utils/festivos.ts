function calcularPascua(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, mes - 1, dia);
}

function siguienteLunes(d: Date): Date {
  const r = new Date(d);
  if (r.getDay() === 0) { r.setDate(r.getDate() + 1); return r; }
  if (r.getDay() <= 1) return r;
  r.setDate(r.getDate() + (8 - r.getDay()));
  return r;
}

function sumarDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function getFestivos(year: number): { date: Date; name: string }[] {
  const pascua = calcularPascua(year);
  const juevesSanto = sumarDias(pascua, -3);
  const viernesSanto = sumarDias(pascua, -2);
  const ascension = siguienteLunes(sumarDias(pascua, 40));
  const corpusChristi = siguienteLunes(sumarDias(pascua, 61));
  const sagradoCorazon = siguienteLunes(sumarDias(pascua, 69));

  return [
    { date: new Date(year, 0, 1), name: "Año Nuevo" },
    { date: siguienteLunes(new Date(year, 0, 6)), name: "Reyes Magos" },
    { date: siguienteLunes(new Date(year, 2, 19)), name: "San José" },
    { date: juevesSanto, name: "Jueves Santo" },
    { date: viernesSanto, name: "Viernes Santo" },
    { date: new Date(year, 4, 1), name: "Día del Trabajo" },
    { date: ascension, name: "Ascensión del Señor" },
    { date: corpusChristi, name: "Corpus Christi" },
    { date: sagradoCorazon, name: "Sagrado Corazón de Jesús" },
    { date: siguienteLunes(new Date(year, 5, 29)), name: "San Pedro y San Pablo" },
    { date: new Date(year, 6, 20), name: "Independencia de Colombia" },
    { date: new Date(year, 7, 7), name: "Batalla de Boyacá" },
    { date: siguienteLunes(new Date(year, 7, 15)), name: "Asunción de la Virgen" },
    { date: siguienteLunes(new Date(year, 9, 12)), name: "Día de la Raza" },
    { date: siguienteLunes(new Date(year, 10, 1)), name: "Todos los Santos" },
    { date: siguienteLunes(new Date(year, 10, 11)), name: "Independencia de Cartagena" },
    { date: new Date(year, 11, 8), name: "Inmaculada Concepción" },
    { date: new Date(year, 11, 25), name: "Navidad" },
  ];
}

export function esFestivo(date: Date): { es: boolean; nombre?: string } {
  const festivos = getFestivos(date.getFullYear());
  for (const f of festivos) {
    if (f.date.getDate() === date.getDate() &&
        f.date.getMonth() === date.getMonth() &&
        f.date.getFullYear() === date.getFullYear()) {
      return { es: true, nombre: f.name };
    }
  }
  return { es: false };
}
