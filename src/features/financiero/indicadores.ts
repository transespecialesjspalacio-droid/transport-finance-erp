import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getIndicadoresFinancieros() {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const empresaId = session.user.empresaId;

  const [totalPorCobrar, totalPorPagar, cuentasCobrar, cuentasPagar] = await Promise.all([
    prisma.cuentaCobrar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    prisma.cuentaPagar.aggregate({
      where: { empresaId, estado: { not: "PAGADO" } },
      _sum: { saldoPendiente: true },
    }),
    prisma.cuentaCobrar.findMany({
      where: { empresaId, estado: { not: "PAGADO" } },
      select: { saldoPendiente: true, fechaVencimiento: true },
    }),
    prisma.cuentaPagar.findMany({
      where: { empresaId, estado: { not: "PAGADO" } },
      select: { saldoPendiente: true, fechaVencimiento: true },
    }),
  ]);

  const ahora = new Date();

  const carteraVencida = cuentasCobrar
    .filter((c) => c.fechaVencimiento < ahora && Number(c.saldoPendiente) > 0)
    .reduce((sum, c) => sum + Number(c.saldoPendiente), 0);

  const pagosVencidos = cuentasPagar
    .filter((c) => c.fechaVencimiento < ahora && Number(c.saldoPendiente) > 0)
    .reduce((sum, c) => sum + Number(c.saldoPendiente), 0);

  return {
    totalPorCobrar: Number(totalPorCobrar._sum?.saldoPendiente ?? 0),
    totalPorPagar: Number(totalPorPagar._sum?.saldoPendiente ?? 0),
    carteraVencida,
    pagosVencidos,
  };
}
