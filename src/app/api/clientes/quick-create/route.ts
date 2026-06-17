import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { clienteSchema } from "@/features/clientes/schemas/cliente-schema";
import { generateCodigo, getNextConsecutive } from "@/lib/codigo";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.empresaId) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const formData = await request.formData();
  const raw = Object.fromEntries(formData);
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return new NextResponse(parsed.error.issues.map((e) => e.message).join(", "), { status: 400 });
  }

  const consecutive = await getNextConsecutive(session.user.empresaId, prisma);
  const codigo = generateCodigo(parsed.data.nombre, consecutive);
  const data = { ...parsed.data, rfc: parsed.data.rfc || codigo, codigo, empresaId: session.user.empresaId };

  const cliente = await prisma.cliente.create({ data });

  revalidatePath("/clientes");

  return NextResponse.json({
    id: cliente.id,
    nombre: cliente.nombre,
    codigo: cliente.codigo,
    rfc: cliente.rfc,
  });
}

function revalidatePath(_path: string) {
  void _path;
}
