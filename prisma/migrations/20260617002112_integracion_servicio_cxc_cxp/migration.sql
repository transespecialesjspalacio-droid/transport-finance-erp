/*
  Warnings:

  - Made the column `tipo_vehiculo` on table `vehiculos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "RealizadoPor" AS ENUM ('PROPIO', 'TERCERO');

-- CreateEnum
CREATE TYPE "OrigenCxc" AS ENUM ('MANUAL', 'SERVICIO_AUTOMATICO');

-- CreateEnum
CREATE TYPE "OrigenCxp" AS ENUM ('MANUAL', 'SERVICIO_TERCERO');

-- AlterEnum
ALTER TYPE "EstadoCuenta" ADD VALUE 'CANCELADO';

-- AlterTable
ALTER TABLE "cuentas_cobrar" ADD COLUMN     "origen" "OrigenCxc" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "cuentas_pagar" ADD COLUMN     "origen" "OrigenCxp" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "fecha_vencimiento_pago" TIMESTAMP(3),
ADD COLUMN     "realizado_por" "RealizadoPor" NOT NULL DEFAULT 'PROPIO',
ADD COLUMN     "tercero_id" TEXT,
ADD COLUMN     "valor_a_pagar" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "vehiculos" ALTER COLUMN "tipo_vehiculo" SET NOT NULL,
ALTER COLUMN "tipo_vehiculo" SET DEFAULT 'BUSETA';

-- CreateIndex
CREATE INDEX "servicios_empresa_id_tercero_id_idx" ON "servicios"("empresa_id", "tercero_id");

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_tercero_id_fkey" FOREIGN KEY ("tercero_id") REFERENCES "terceros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
