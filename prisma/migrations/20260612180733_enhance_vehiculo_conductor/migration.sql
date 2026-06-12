-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('CAMION', 'CAMIONETA', 'TRAILER', 'VOLQUETE', 'GRUA', 'OTRO');

-- CreateEnum
CREATE TYPE "PropietarioVehiculo" AS ENUM ('PROPIO', 'TERCERO');

-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('DISPONIBLE', 'EN_SERVICIO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "EstadoConductor" AS ENUM ('DISPONIBLE', 'EN_SERVICIO', 'DE_BAJA');

-- AlterTable
ALTER TABLE "conductores" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "documento" TEXT,
ADD COLUMN     "estado" "EstadoConductor" NOT NULL DEFAULT 'DISPONIBLE',
ADD COLUMN     "fecha_vencimiento" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "estado" "EstadoVehiculo" NOT NULL DEFAULT 'DISPONIBLE',
ADD COLUMN     "propietario" "PropietarioVehiculo" NOT NULL DEFAULT 'PROPIO',
ADD COLUMN     "tipo_vehiculo" "TipoVehiculo" NOT NULL DEFAULT 'OTRO',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
