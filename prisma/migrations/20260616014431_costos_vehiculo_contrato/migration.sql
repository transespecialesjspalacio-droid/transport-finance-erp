-- AlterTable
ALTER TABLE "costos_servicio" ADD COLUMN     "contrato_id" TEXT,
ADD COLUMN     "vehiculo_id" TEXT;

-- CreateIndex
CREATE INDEX "costos_servicio_empresa_id_vehiculo_id_idx" ON "costos_servicio"("empresa_id", "vehiculo_id");

-- CreateIndex
CREATE INDEX "costos_servicio_empresa_id_contrato_id_idx" ON "costos_servicio"("empresa_id", "contrato_id");

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
