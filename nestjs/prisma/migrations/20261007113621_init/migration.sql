-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('BORRADOR', 'ACTIVO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoJornada" AS ENUM ('ABIERTA', 'PLANIFICADA', 'EN_EJECUCION', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoPlanificacion" AS ENUM ('BORRADOR', 'PROCESANDO', 'GENERADA', 'APROBADA', 'EN_EJECUCION', 'FINALIZADA', 'ERROR');

-- CreateEnum
CREATE TYPE "EstadoRuta" AS ENUM ('PENDIENTE', 'ASIGNADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'EN_RUTA', 'ENTREGADA', 'PARCIAL', 'NO_ENTREGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('CAMION', 'CAMIONETA', 'FURGON', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoEstrategiaSectorizacion" AS ENUM ('KMEANS', 'DBSCAN');

-- CreateEnum
CREATE TYPE "EstadoOptimizacion" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'ERROR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentacionProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidades" INTEGER NOT NULL,
    "pesoKg" DECIMAL(12,3),
    "volumenM3" DECIMAL(12,6),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresentacionProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoContrato" NOT NULL DEFAULT 'BORRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntoEntregaContrato" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(10,7) NOT NULL,
    "longitud" DECIMAL(10,7) NOT NULL,
    "tiempoServicioMinutos" INTEGER NOT NULL DEFAULT 10,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuntoEntregaContrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentanaEntrega" (
    "id" TEXT NOT NULL,
    "puntoEntregaContratoId" TEXT NOT NULL,
    "diaSemana" INTEGER,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "VentanaEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "codigo" TEXT,
    "estado" "EstadoJornada" NOT NULL DEFAULT 'ABIERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demanda" (
    "id" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "puntoEntregaContratoId" TEXT NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandaDetalle" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "DemandaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadDisponible" DECIMAL(12,3) NOT NULL,
    "cantidadReservada" DECIMAL(12,3) NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "tipo" "TipoVehiculo" NOT NULL,
    "capacidadPesoKg" DECIMAL(12,3),
    "capacidadVolumenM3" DECIMAL(12,6),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planificacion" (
    "id" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPlanificacion" NOT NULL DEFAULT 'BORRADOR',
    "estrategiaSectorizacion" "TipoEstrategiaSectorizacion",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Planificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "algoritmo" "TipoEstrategiaSectorizacion" NOT NULL,
    "centroLatitud" DECIMAL(10,7),
    "centroLongitud" DECIMAL(10,7),
    "parametros" JSONB,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorPunto" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "puntoEntregaId" TEXT NOT NULL,

    CONSTRAINT "SectorPunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carga" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "pesoTotalKg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "volumenTotalM3" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Carga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "cargaId" TEXT,
    "vehiculoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ordenGenerado" INTEGER,
    "distanciaKm" DECIMAL(12,3),
    "tiempoMinutos" INTEGER,
    "estado" "EstadoRuta" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" TEXT NOT NULL,
    "rutaId" TEXT NOT NULL,
    "puntoEntregaId" TEXT NOT NULL,
    "demandaId" TEXT,
    "orden" INTEGER NOT NULL,
    "distanciaKm" DECIMAL(12,3),
    "tiempoEstimadoMinutos" INTEGER,
    "estado" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Optimizacion" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "algoritmo" TEXT NOT NULL,
    "parametros" JSONB,
    "resultado" JSONB,
    "distanciaInicialKm" DECIMAL(12,3),
    "distanciaFinalKm" DECIMAL(12,3),
    "tiempoInicialMinutos" INTEGER,
    "tiempoFinalMinutos" INTEGER,
    "mejoraDistanciaPorcentaje" DECIMAL(8,3),
    "estado" "EstadoOptimizacion" NOT NULL DEFAULT 'PENDIENTE',
    "iniciadoAt" TIMESTAMP(3),
    "finalizadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Optimizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_estado_idx" ON "Usuario"("estado");

-- CreateIndex
CREATE INDEX "Usuario_createdAt_idx" ON "Usuario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE INDEX "Producto_nombre_idx" ON "Producto"("nombre");

-- CreateIndex
CREATE INDEX "Producto_estado_idx" ON "Producto"("estado");

-- CreateIndex
CREATE INDEX "PresentacionProducto_productoId_idx" ON "PresentacionProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_codigo_key" ON "Contrato"("codigo");

-- CreateIndex
CREATE INDEX "Contrato_estado_idx" ON "Contrato"("estado");

-- CreateIndex
CREATE INDEX "Contrato_fechaInicio_fechaFin_idx" ON "Contrato"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "PuntoEntregaContrato_contratoId_idx" ON "PuntoEntregaContrato"("contratoId");

-- CreateIndex
CREATE INDEX "PuntoEntregaContrato_latitud_longitud_idx" ON "PuntoEntregaContrato"("latitud", "longitud");

-- CreateIndex
CREATE UNIQUE INDEX "PuntoEntregaContrato_contratoId_codigo_key" ON "PuntoEntregaContrato"("contratoId", "codigo");

-- CreateIndex
CREATE INDEX "VentanaEntrega_puntoEntregaContratoId_idx" ON "VentanaEntrega"("puntoEntregaContratoId");

-- CreateIndex
CREATE INDEX "Jornada_fecha_idx" ON "Jornada"("fecha");

-- CreateIndex
CREATE INDEX "Jornada_estado_idx" ON "Jornada"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Jornada_contratoId_fecha_key" ON "Jornada"("contratoId", "fecha");

-- CreateIndex
CREATE INDEX "Demanda_jornadaId_idx" ON "Demanda"("jornadaId");

-- CreateIndex
CREATE INDEX "Demanda_puntoEntregaContratoId_idx" ON "Demanda"("puntoEntregaContratoId");

-- CreateIndex
CREATE UNIQUE INDEX "Demanda_jornadaId_puntoEntregaContratoId_key" ON "Demanda"("jornadaId", "puntoEntregaContratoId");

-- CreateIndex
CREATE INDEX "DemandaDetalle_productoId_idx" ON "DemandaDetalle"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandaDetalle_demandaId_productoId_key" ON "DemandaDetalle"("demandaId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_codigo_key" ON "Almacen"("codigo");

-- CreateIndex
CREATE INDEX "Lote_productoId_idx" ON "Lote"("productoId");

-- CreateIndex
CREATE INDEX "Lote_fechaVencimiento_idx" ON "Lote"("fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_almacenId_codigo_key" ON "Lote"("almacenId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_almacenId_productoId_key" ON "Stock"("almacenId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_codigo_key" ON "Vehiculo"("codigo");

-- CreateIndex
CREATE INDEX "Vehiculo_estado_idx" ON "Vehiculo"("estado");

-- CreateIndex
CREATE INDEX "Planificacion_jornadaId_idx" ON "Planificacion"("jornadaId");

-- CreateIndex
CREATE INDEX "Planificacion_estado_idx" ON "Planificacion"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_planificacionId_codigo_key" ON "Sector"("planificacionId", "codigo");

-- CreateIndex
CREATE INDEX "SectorPunto_sectorId_idx" ON "SectorPunto"("sectorId");

-- CreateIndex
CREATE INDEX "SectorPunto_puntoEntregaId_idx" ON "SectorPunto"("puntoEntregaId");

-- CreateIndex
CREATE INDEX "Carga_planificacionId_idx" ON "Carga"("planificacionId");

-- CreateIndex
CREATE INDEX "Carga_vehiculoId_idx" ON "Carga"("vehiculoId");

-- CreateIndex
CREATE INDEX "Ruta_planificacionId_idx" ON "Ruta"("planificacionId");

-- CreateIndex
CREATE INDEX "Ruta_vehiculoId_idx" ON "Ruta"("vehiculoId");

-- CreateIndex
CREATE INDEX "Ruta_estado_idx" ON "Ruta"("estado");

-- CreateIndex
CREATE INDEX "Entrega_puntoEntregaId_idx" ON "Entrega"("puntoEntregaId");

-- CreateIndex
CREATE INDEX "Entrega_demandaId_idx" ON "Entrega"("demandaId");

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_rutaId_orden_key" ON "Entrega"("rutaId", "orden");

-- CreateIndex
CREATE INDEX "Optimizacion_planificacionId_idx" ON "Optimizacion"("planificacionId");

-- CreateIndex
CREATE INDEX "Optimizacion_estado_idx" ON "Optimizacion"("estado");

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionProducto" ADD CONSTRAINT "PresentacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntoEntregaContrato" ADD CONSTRAINT "PuntoEntregaContrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentanaEntrega" ADD CONSTRAINT "VentanaEntrega_puntoEntregaContratoId_fkey" FOREIGN KEY ("puntoEntregaContratoId") REFERENCES "PuntoEntregaContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_puntoEntregaContratoId_fkey" FOREIGN KEY ("puntoEntregaContratoId") REFERENCES "PuntoEntregaContrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDetalle" ADD CONSTRAINT "DemandaDetalle_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDetalle" ADD CONSTRAINT "DemandaDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planificacion" ADD CONSTRAINT "Planificacion_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planificacion" ADD CONSTRAINT "Planificacion_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "Planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorPunto" ADD CONSTRAINT "SectorPunto_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carga" ADD CONSTRAINT "Carga_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carga" ADD CONSTRAINT "Carga_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "Planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "Planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Optimizacion" ADD CONSTRAINT "Optimizacion_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "Planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
