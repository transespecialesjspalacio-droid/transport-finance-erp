import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAILS = [
  "johansebastianpalacioalvarez@gmail.com",
  "johaalvarez81@gmail.com",
  "lorerestrepo09@gmail.com",
];

async function main() {
  for (const email of EMAILS) {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (user) {
      await prisma.usuario.update({
        where: { email },
        data: { googleEnabled: true },
      });
      console.log(`✅ ${email} habilitado para Google Sign-In`);
    } else {
      console.log(`⚠️  ${email} no encontrado en la base de datos. Crea el usuario primero.`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
