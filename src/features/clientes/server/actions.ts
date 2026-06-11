"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { clienteSchema } from "../schemas/cliente-schema";
import { generateCodigo, getNextConsecutive } from "@/lib/codigo";

export async function createCliente(formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  const consecutive = await getNextConsecutive(session.user.empresaId, "cliente", prisma);
  const codigo = generateCodigo(parsed.data.nombre, consecutive);
  const data = { ...parsed.data, rfc: parsed.data.rfc || codigo, codigo, empresaId: session.user.empresaId };

  await prisma.cliente.create({ data });

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  const raw = Object.fromEntries(formData);
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));

  await prisma.cliente.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: parsed.data,
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}

export async function deleteCliente(id: string) {
  const session = await auth();
  if (!session?.user?.empresaId) throw new Error("No autorizado");

  await prisma.cliente.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/clientes");
}
