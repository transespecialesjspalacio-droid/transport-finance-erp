-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "fecha_vencimiento_poliza" TIMESTAMP(3),
ADD COLUMN     "fecha_vencimiento_soat" TIMESTAMP(3),
ADD COLUMN     "fecha_vencimiento_tecnomecanica" TIMESTAMP(3),
ADD COLUMN     "observaciones" TEXT;
