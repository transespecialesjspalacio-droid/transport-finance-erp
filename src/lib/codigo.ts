export function generateCodigo(nombre: string, consecutive: number): string {
  const words = nombre.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  const lastWord = words[words.length - 1] ?? "";

  const prefix = firstWord.slice(0, Math.min(3, firstWord.length)).toUpperCase();
  const suffix = lastWord.slice(-3).toUpperCase();

  return `${prefix}-${String(consecutive).padStart(4, "0")}-${suffix}`;
}

import type { PrismaClient } from "@prisma/client";

export async function getNextConsecutive(
  empresaId: string,
  model: "cliente" | "tercero",
  prisma: PrismaClient
): Promise<number> {
  const table = model === "cliente" ? "Cliente" : "Tercero";
  const rows: { codigo: string | null }[] =
    await prisma.$queryRawUnsafe(
      `SELECT codigo FROM "${table}" WHERE "empresaId" = $1 AND codigo IS NOT NULL ORDER BY codigo DESC LIMIT 1`,
      empresaId
    );

  const latest = rows[0];
  if (!latest?.codigo) return 1;

  const match = latest.codigo.match(/-(\d+)-/);
  return match ? parseInt(match[1], 10) + 1 : 1;
}
