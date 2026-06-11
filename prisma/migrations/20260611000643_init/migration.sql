-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPS', 'FINANZAS', 'VIEWER');

-- CreateEnum
CREATE TYPE "TipoServicioContrato" AS ENUM ('ESCOLAR', 'CORPORATIVO', 'MEDICO', 'EVENTO');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('REGULAR', 'EXTRA', 'EVENTUAL');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'TARJETA');

-- CreateEnum
CREATE TYPE "CondicionPago" AS ENUM ('DIAS_30', 'DIAS_60', 'ANTICIPADO');

-- CreateEnum
CREATE TYPE "CategoriaCosto" AS ENUM ('FIJO', 'VARIABLE');

-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('COMBUSTIBLE', 'TALLER', 'VIATICOS', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoFlujoCaja" AS ENUM ('REAL', 'PROYECTADO');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "logo" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "contacto_nombre" TEXT,
    "contacto_email" TEXT,
    "contacto_telefono" TEXT,
    "direccion" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo_servicio" "TipoServicioContrato" NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "monto_mensual" DECIMAL(65,30),
    "condicion_pago" "CondicionPago" NOT NULL DEFAULT 'DIAS_30',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "vehiculo_id" TEXT,
    "conductor_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3),
    "hora_fin" TIMESTAMP(3),
    "origen" TEXT,
    "destino" TEXT,
    "distancia_km" DECIMAL(65,30),
    "tipo_servicio" "TipoServicio" NOT NULL DEFAULT 'REGULAR',
    "tarifa_aplicada" DECIMAL(65,30) NOT NULL,
    "ingreso_esperado" DECIMAL(65,30) NOT NULL,
    "ingreso_real" DECIMAL(65,30),
    "estado" "EstadoServicio" NOT NULL DEFAULT 'PROGRAMADO',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_servicio" (
    "id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo_costo_id" TEXT NOT NULL,
    "proveedor_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "total" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "costos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_costo" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaCosto" NOT NULL DEFAULT 'VARIABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_costo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT,
    "tipo" "TipoProveedor" NOT NULL DEFAULT 'OTRO',
    "contacto" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_cobrar" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "servicio_id" TEXT,
    "factura_id" TEXT,
    "monto_total" DECIMAL(65,30) NOT NULL,
    "saldo_pendiente" DECIMAL(65,30) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCuenta" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_cobrar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobros" (
    "id" TEXT NOT NULL,
    "cuenta_cobrar_id" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "referencia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_pagar" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "servicio_id" TEXT,
    "monto_total" DECIMAL(65,30) NOT NULL,
    "saldo_pendiente" DECIMAL(65,30) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCuenta" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "cuenta_pagar_id" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "referencia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductores" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "licencia" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flujo_caja" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "saldo_inicial" DECIMAL(65,30) NOT NULL,
    "ingresos_del_dia" DECIMAL(65,30) NOT NULL,
    "egresos_del_dia" DECIMAL(65,30) NOT NULL,
    "saldo_final" DECIMAL(65,30) NOT NULL,
    "tipo" "TipoFlujoCaja" NOT NULL DEFAULT 'REAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flujo_caja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rfc_key" ON "empresas"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "conductores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_tipo_costo_id_fkey" FOREIGN KEY ("tipo_costo_id") REFERENCES "tipos_costo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_servicio" ADD CONSTRAINT "costos_servicio_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_costo" ADD CONSTRAINT "tipos_costo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobrar" ADD CONSTRAINT "cuentas_cobrar_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobrar" ADD CONSTRAINT "cuentas_cobrar_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobrar" ADD CONSTRAINT "cuentas_cobrar_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobrar" ADD CONSTRAINT "cuentas_cobrar_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_cuenta_cobrar_id_fkey" FOREIGN KEY ("cuenta_cobrar_id") REFERENCES "cuentas_cobrar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_pagar" ADD CONSTRAINT "cuentas_pagar_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_pagar" ADD CONSTRAINT "cuentas_pagar_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_pagar" ADD CONSTRAINT "cuentas_pagar_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cuenta_pagar_id_fkey" FOREIGN KEY ("cuenta_pagar_id") REFERENCES "cuentas_pagar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conductores" ADD CONSTRAINT "conductores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flujo_caja" ADD CONSTRAINT "flujo_caja_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
