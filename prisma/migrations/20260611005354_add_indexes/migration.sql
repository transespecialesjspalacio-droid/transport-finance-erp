-- CreateIndex
CREATE INDEX "clientes_empresa_id_active_idx" ON "clientes"("empresa_id", "active");

-- CreateIndex
CREATE INDEX "clientes_empresa_id_nombre_idx" ON "clientes"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "cobros_cuenta_cobrar_id_fecha_pago_idx" ON "cobros"("cuenta_cobrar_id", "fecha_pago");

-- CreateIndex
CREATE INDEX "conductores_empresa_id_active_idx" ON "conductores"("empresa_id", "active");

-- CreateIndex
CREATE INDEX "contratos_empresa_id_active_idx" ON "contratos"("empresa_id", "active");

-- CreateIndex
CREATE INDEX "contratos_empresa_id_cliente_id_idx" ON "contratos"("empresa_id", "cliente_id");

-- CreateIndex
CREATE INDEX "contratos_empresa_id_codigo_idx" ON "contratos"("empresa_id", "codigo");

-- CreateIndex
CREATE INDEX "costos_servicio_empresa_id_servicio_id_idx" ON "costos_servicio"("empresa_id", "servicio_id");

-- CreateIndex
CREATE INDEX "costos_servicio_empresa_id_tercero_id_idx" ON "costos_servicio"("empresa_id", "tercero_id");

-- CreateIndex
CREATE INDEX "costos_servicio_empresa_id_fecha_idx" ON "costos_servicio"("empresa_id", "fecha");

-- CreateIndex
CREATE INDEX "cuentas_cobrar_empresa_id_estado_idx" ON "cuentas_cobrar"("empresa_id", "estado");

-- CreateIndex
CREATE INDEX "cuentas_cobrar_empresa_id_fecha_vencimiento_idx" ON "cuentas_cobrar"("empresa_id", "fecha_vencimiento");

-- CreateIndex
CREATE INDEX "cuentas_cobrar_empresa_id_estado_fecha_vencimiento_idx" ON "cuentas_cobrar"("empresa_id", "estado", "fecha_vencimiento");

-- CreateIndex
CREATE INDEX "cuentas_cobrar_empresa_id_cliente_id_idx" ON "cuentas_cobrar"("empresa_id", "cliente_id");

-- CreateIndex
CREATE INDEX "cuentas_cobrar_empresa_id_contrato_id_idx" ON "cuentas_cobrar"("empresa_id", "contrato_id");

-- CreateIndex
CREATE INDEX "cuentas_pagar_empresa_id_estado_idx" ON "cuentas_pagar"("empresa_id", "estado");

-- CreateIndex
CREATE INDEX "cuentas_pagar_empresa_id_fecha_vencimiento_idx" ON "cuentas_pagar"("empresa_id", "fecha_vencimiento");

-- CreateIndex
CREATE INDEX "cuentas_pagar_empresa_id_estado_fecha_vencimiento_idx" ON "cuentas_pagar"("empresa_id", "estado", "fecha_vencimiento");

-- CreateIndex
CREATE INDEX "cuentas_pagar_empresa_id_tercero_id_idx" ON "cuentas_pagar"("empresa_id", "tercero_id");

-- CreateIndex
CREATE INDEX "flujo_caja_empresa_id_fecha_idx" ON "flujo_caja"("empresa_id", "fecha");

-- CreateIndex
CREATE INDEX "flujo_caja_empresa_id_tipo_idx" ON "flujo_caja"("empresa_id", "tipo");

-- CreateIndex
CREATE INDEX "pagos_cuenta_pagar_id_fecha_pago_idx" ON "pagos"("cuenta_pagar_id", "fecha_pago");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_estado_idx" ON "servicios"("empresa_id", "estado");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_fecha_idx" ON "servicios"("empresa_id", "fecha");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_estado_fecha_idx" ON "servicios"("empresa_id", "estado", "fecha");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_contrato_id_idx" ON "servicios"("empresa_id", "contrato_id");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_vehiculo_id_idx" ON "servicios"("empresa_id", "vehiculo_id");

-- CreateIndex
CREATE INDEX "servicios_empresa_id_conductor_id_idx" ON "servicios"("empresa_id", "conductor_id");

-- CreateIndex
CREATE INDEX "terceros_empresa_id_active_idx" ON "terceros"("empresa_id", "active");

-- CreateIndex
CREATE INDEX "terceros_empresa_id_tipo_tercero_idx" ON "terceros"("empresa_id", "tipo_tercero");

-- CreateIndex
CREATE INDEX "tipos_costo_empresa_id_active_idx" ON "tipos_costo"("empresa_id", "active");

-- CreateIndex
CREATE INDEX "usuarios_empresa_id_email_idx" ON "usuarios"("empresa_id", "email");

-- CreateIndex
CREATE INDEX "usuarios_empresa_id_role_idx" ON "usuarios"("empresa_id", "role");

-- CreateIndex
CREATE INDEX "vehiculos_empresa_id_active_idx" ON "vehiculos"("empresa_id", "active");
