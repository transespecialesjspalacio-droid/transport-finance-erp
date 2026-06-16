-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "fecha_regreso" TIMESTAMP(3),
ADD COLUMN     "hora_regreso" TIMESTAMP(3),
ADD COLUMN     "hora_salida" TIMESTAMP(3),
ADD COLUMN     "observaciones_operativas" TEXT,
ADD COLUMN     "pasajeros" INTEGER;
