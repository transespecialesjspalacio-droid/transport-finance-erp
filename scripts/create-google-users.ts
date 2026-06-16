import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const p = new PrismaClient();
const EMAILS = [
  { email: "johansebastianpalacioalvarez@gmail.com", name: "Johan Palacio", role: Role.ADMIN },
  { email: "johaalvarez81@gmail.com", name: "Johan Álvarez", role: Role.ADMIN },
  { email: "lorerestrepo09@gmail.com", name: "Lorena Restrepo", role: Role.ADMIN },
];

async function main() {
  const empresa = await p.empresa.findFirst();
  if (!empresa) { console.error("No hay empresa"); return; }

  for (const u of EMAILS) {
    const existing = await p.usuario.findUnique({ where: { email: u.email } });
    if (existing) {
      await p.usuario.update({
        where: { email: u.email },
        data: { googleEnabled: true },
      });
      console.log(`✅ ${u.email} actualizado → googleEnabled=true`);
    } else {
      await p.usuario.create({
        data: {
          empresaId: empresa.id,
          name: u.name,
          email: u.email,
          password: await bcrypt.hash("google-only-" + Date.now(), 10),
          role: u.role,
          googleEnabled: true,
        },
      });
      console.log(`✅ ${u.email} creado con googleEnabled=true`);
    }
  }
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => p.$disconnect());
