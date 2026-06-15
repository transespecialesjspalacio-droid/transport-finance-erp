-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('POR_SERVICIOS', 'RECURRENTE', 'MIXTO');

-- CreateEnum
CREATE TYPE "Periodicidad" AS ENUM ('MENSUAL', 'QUINCENAL', 'SEMANAL', 'DIARIO');

-- CreateEnum
CREATE TYPE "CategoriaAdjunto" AS ENUM ('PROGRAMACION', 'FACTURA', 'ACTA', 'SOPORTE', 'OTRO');

-- AlterTable
ALTER TABLE "contratos" ADD COLUMN     "dia_corte" INTEGER DEFAULT 1,
ADD COLUMN     "periodicidad" "Periodicidad",
ADD COLUMN     "rentabilidad_base" DECIMAL(65,30),
ADD COLUMN     "tipo_contrato" "TipoContrato" NOT NULL DEFAULT 'POR_SERVICIOS',
ADD COLUMN     "valor_recurrente" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "contratos_adjuntos" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoria" "CategoriaAdjunto" NOT NULL DEFAULT 'OTRO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contratos_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contratos_adjuntos_contrato_id_idx" ON "contratos_adjuntos"("contrato_id");

-- AddForeignKey
ALTER TABLE "contratos_adjuntos" ADD CONSTRAINT "contratos_adjuntos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos_adjuntos" ADD CONSTRAINT "contratos_adjuntos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
