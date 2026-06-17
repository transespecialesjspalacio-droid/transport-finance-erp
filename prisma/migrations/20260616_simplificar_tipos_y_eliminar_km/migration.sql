-- Migrate TipoVehiculo enum: remove old values, add new ones
-- Since PostgreSQL cannot remove values from an enum, we create a new type and swap

-- 1. Create new enum
CREATE TYPE "TipoVehiculoNuevo" AS ENUM ('BUS', 'BUSETON', 'BUSETA');

-- 2. Add temporary column
ALTER TABLE "vehiculos" ADD COLUMN "tipo_vehiculo_nuevo" "TipoVehiculoNuevo";

-- 3. Migrate existing data: map all old types to closest new type
-- CAMION → BUS, CAMIONETA → BUSETON, TRAILER → BUS, VOLQUETE → BUSETA, GRUA → BUSETA, OTRO → BUSETA
UPDATE "vehiculos" SET "tipo_vehiculo_nuevo" = 
  CASE "tipo_vehiculo"
    WHEN 'CAMION' THEN 'BUS'::"TipoVehiculoNuevo"
    WHEN 'CAMIONETA' THEN 'BUSETON'::"TipoVehiculoNuevo"
    WHEN 'TRAILER' THEN 'BUS'::"TipoVehiculoNuevo"
    WHEN 'VOLQUETE' THEN 'BUSETA'::"TipoVehiculoNuevo"
    WHEN 'GRUA' THEN 'BUSETA'::"TipoVehiculoNuevo"
    WHEN 'OTRO' THEN 'BUSETA'::"TipoVehiculoNuevo"
    ELSE 'BUSETA'::"TipoVehiculoNuevo"
  END;

-- 4. Drop old column
ALTER TABLE "vehiculos" DROP COLUMN "tipo_vehiculo";

-- 5. Rename new column
ALTER TABLE "vehiculos" RENAME COLUMN "tipo_vehiculo_nuevo" TO "tipo_vehiculo";

-- 6. Drop old enum type
DROP TYPE IF EXISTS "TipoVehiculo";

-- 7. Rename new type back to the expected name (so Prisma can write to it)
ALTER TYPE "TipoVehiculoNuevo" RENAME TO "TipoVehiculo";

-- 8. Remove unused km columns from servicios
ALTER TABLE "servicios" DROP COLUMN IF EXISTS "distancia_km";
ALTER TABLE "servicios" DROP COLUMN IF EXISTS "km_recorridos";
