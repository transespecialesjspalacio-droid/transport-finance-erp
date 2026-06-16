import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.usuario.findMany({select:{email:true,name:true,googleEnabled:true}}).then(r => {
  r.forEach(u => console.log(u.email, "-", u.name, "- googleEnabled:", u.googleEnabled));
  console.log("Total:", r.length);
  return p.$disconnect();
});
