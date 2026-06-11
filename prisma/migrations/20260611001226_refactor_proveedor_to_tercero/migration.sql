/*
  Warnings:

  - You are about to drop the column `proveedor_id` on the `costos_servicio` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor_id` on the `cuentas_pagar` table. All the data in the column will be lost.
  - You are about to drop the `proveedores` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tercero_id` to the `cuentas_pagar` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoTercero" AS ENUM ('TRANSPORTADOR', 'CONDUCTOR', 'COMBUSTIBLE', 'PEAJES', 'MANTENIMIENTO', 'OTRO');

-- DropForeignKey
ALTER TABLE "costos_servicio" DROP CONSTRAINT "costos_servicio_proveedor_id_fkey";

-- DropForeignKey
ALTER TABLE "cuentas_pagar" DROP CONSTRAINT "cuentas_pagar_proveedor_id_fkey";

-- DropForeignKey
ALTER TABLE "proveedores" DROP CONSTRAINT "proveedores_empresa_id_fkey";

-- AlterTable
ALTER TABLE "costos_servicio" DROP COLUMN "proveedor_id",
ADD COLUMN     "tercero_id" TEXT;

-- AlterTable
ALTER TABLE "cuentas_pagar" DROP COLUMN "proveedor_id",
ADD COLUMN     "tercero_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "proveedores";

-- DropEnum
DROP TYPE "TipoProveedor";

-- CreateTable
CREATE TABLE "terceros" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT,
    "tipo_tercero" "TipoTercero" NOT NULL DEFAULT 'OTRO',
    "contacto" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terceros_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_tercero_id_fkey" FOREIGN KEY ("tercero_id") REFERENCES "terceros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terceros" ADD CONSTRAINT "terceros_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_pagar" ADD CONSTRAINT "cuentas_pagar_tercero_id_fkey" FOREIGN KEY ("tercero_id") REFERENCES "terceros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
