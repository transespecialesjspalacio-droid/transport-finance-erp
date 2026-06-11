import { PrismaClient, Role, CondicionPago, TipoServicioContrato, TipoTercero } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { rfc: "TE-240101-ABC" },
    update: {},
    create: {
      nombre: "Transporte Especial Ejemplo S.A. de C.V.",
      rfc: "TE-240101-ABC",
      moneda: "MXN",
    },
  });

  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@transporte.com" },
    update: {},
    create: {
      empresaId: empresa.id,
      name: "Admin Sistema",
      email: "admin@transporte.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "finanzas@transporte.com" },
    update: {},
    create: {
      empresaId: empresa.id,
      name: "Finanzas",
      email: "finanzas@transporte.com",
      password: adminPassword,
      role: Role.FINANZAS,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "ops@transporte.com" },
    update: {},
    create: {
      empresaId: empresa.id,
      name: "Operaciones",
      email: "ops@transporte.com",
      password: adminPassword,
      role: Role.OPS,
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { id: "cli-001" },
    update: {},
    create: {
      id: "cli-001",
      empresaId: empresa.id,
      nombre: "Colegio ABC S.C.",
      rfc: "CABC-123456-XYZ",
      contactoNombre: "Juan Pérez",
      contactoEmail: "juan@colegioabc.com",
      contactoTelefono: "555-123-4567",
    },
  });

  await prisma.cliente.upsert({
    where: { id: "cli-002" },
    update: {},
    create: {
      id: "cli-002",
      empresaId: empresa.id,
      nombre: "Grupo Médico del Sur S.A.",
      rfc: "GMS-789012-ABC",
      contactoNombre: "María López",
      contactoEmail: "maria@gmsur.com",
      contactoTelefono: "555-987-6543",
    },
  });

  await prisma.contrato.upsert({
    where: { id: "ct-001" },
    update: {},
    create: {
      id: "ct-001",
      clienteId: cliente.id,
      empresaId: empresa.id,
      codigo: "CT-2026-001",
      nombre: "Transporte Escolar ABC - Ruta Norte",
      tipoServicio: TipoServicioContrato.ESCOLAR,
      fechaInicio: new Date("2026-01-15"),
      fechaFin: new Date("2026-12-15"),
      montoMensual: 45000,
      condicionPago: CondicionPago.DIAS_30,
    },
  });

  await prisma.tipoCosto.upsert({
    where: { id: "tc-001" },
    update: {},
    create: {
      id: "tc-001",
      empresaId: empresa.id,
      nombre: "Combustible",
      categoria: "VARIABLE",
    },
  });

  await prisma.tipoCosto.upsert({
    where: { id: "tc-002" },
    update: {},
    create: {
      id: "tc-002",
      empresaId: empresa.id,
      nombre: "Peaje",
      categoria: "VARIABLE",
    },
  });

  await prisma.tipoCosto.upsert({
    where: { id: "tc-003" },
    update: {},
    create: {
      id: "tc-003",
      empresaId: empresa.id,
      nombre: "Viáticos Conductor",
      categoria: "VARIABLE",
    },
  });

  await prisma.vehiculo.upsert({
    where: { id: "v-001" },
    update: {},
    create: {
      id: "v-001",
      empresaId: empresa.id,
      placa: "ABC-123",
      marca: "Mercedes-Benz",
      modelo: "Sprinter",
      anio: 2023,
      capacidad: 14,
    },
  });

  await prisma.conductor.upsert({
    where: { id: "cond-001" },
    update: {},
    create: {
      id: "cond-001",
      empresaId: empresa.id,
      nombre: "Carlos López",
      licencia: "LIC-12345",
      telefono: "555-111-2233",
    },
  });

  await prisma.tercero.upsert({
    where: { id: "ter-001" },
    update: {},
    create: {
      id: "ter-001",
      empresaId: empresa.id,
      nombre: "Gasolinera Pemex Norte",
      tipoTercero: TipoTercero.COMBUSTIBLE,
      contacto: "555-222-3344",
    },
  });

  await prisma.tercero.upsert({
    where: { id: "ter-002" },
    update: {},
    create: {
      id: "ter-002",
      empresaId: empresa.id,
      nombre: "Transportes Aliados del Sur",
      tipoTercero: TipoTercero.TRANSPORTADOR,
      rfc: "TAS-890123-XYZ",
      contacto: "555-333-4455",
    },
  });

  await prisma.tercero.upsert({
    where: { id: "ter-003" },
    update: {},
    create: {
      id: "ter-003",
      empresaId: empresa.id,
      nombre: "Taller Mecánico El Rapidito",
      tipoTercero: TipoTercero.MANTENIMIENTO,
      contacto: "555-444-5566",
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
