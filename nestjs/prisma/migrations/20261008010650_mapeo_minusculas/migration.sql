/*
  Warnings:

  - You are about to drop the `Almacen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Carga` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contrato` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Demanda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandaDetalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Entrega` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Jornada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Optimizacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permiso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Planificacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PresentacionProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Producto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PuntoEntregaContrato` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolPermiso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ruta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sector` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SectorPunto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsuarioRol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehiculo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentanaEntrega` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Carga" DROP CONSTRAINT "Carga_planificacionId_fkey";

-- DropForeignKey
ALTER TABLE "Carga" DROP CONSTRAINT "Carga_vehiculoId_fkey";

-- DropForeignKey
ALTER TABLE "Demanda" DROP CONSTRAINT "Demanda_jornadaId_fkey";

-- DropForeignKey
ALTER TABLE "Demanda" DROP CONSTRAINT "Demanda_puntoEntregaContratoId_fkey";

-- DropForeignKey
ALTER TABLE "DemandaDetalle" DROP CONSTRAINT "DemandaDetalle_demandaId_fkey";

-- DropForeignKey
ALTER TABLE "DemandaDetalle" DROP CONSTRAINT "DemandaDetalle_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Entrega" DROP CONSTRAINT "Entrega_rutaId_fkey";

-- DropForeignKey
ALTER TABLE "Jornada" DROP CONSTRAINT "Jornada_contratoId_fkey";

-- DropForeignKey
ALTER TABLE "Lote" DROP CONSTRAINT "Lote_almacenId_fkey";

-- DropForeignKey
ALTER TABLE "Lote" DROP CONSTRAINT "Lote_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Optimizacion" DROP CONSTRAINT "Optimizacion_planificacionId_fkey";

-- DropForeignKey
ALTER TABLE "Planificacion" DROP CONSTRAINT "Planificacion_jornadaId_fkey";

-- DropForeignKey
ALTER TABLE "Planificacion" DROP CONSTRAINT "Planificacion_vehiculoId_fkey";

-- DropForeignKey
ALTER TABLE "PresentacionProducto" DROP CONSTRAINT "PresentacionProducto_productoId_fkey";

-- DropForeignKey
ALTER TABLE "PuntoEntregaContrato" DROP CONSTRAINT "PuntoEntregaContrato_contratoId_fkey";

-- DropForeignKey
ALTER TABLE "RolPermiso" DROP CONSTRAINT "RolPermiso_permisoId_fkey";

-- DropForeignKey
ALTER TABLE "RolPermiso" DROP CONSTRAINT "RolPermiso_rolId_fkey";

-- DropForeignKey
ALTER TABLE "Ruta" DROP CONSTRAINT "Ruta_cargaId_fkey";

-- DropForeignKey
ALTER TABLE "Ruta" DROP CONSTRAINT "Ruta_planificacionId_fkey";

-- DropForeignKey
ALTER TABLE "Ruta" DROP CONSTRAINT "Ruta_vehiculoId_fkey";

-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_planificacionId_fkey";

-- DropForeignKey
ALTER TABLE "SectorPunto" DROP CONSTRAINT "SectorPunto_sectorId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_almacenId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productoId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioRol" DROP CONSTRAINT "UsuarioRol_rolId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioRol" DROP CONSTRAINT "UsuarioRol_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "VentanaEntrega" DROP CONSTRAINT "VentanaEntrega_puntoEntregaContratoId_fkey";

-- DropTable
DROP TABLE "Almacen";

-- DropTable
DROP TABLE "Carga";

-- DropTable
DROP TABLE "Contrato";

-- DropTable
DROP TABLE "Demanda";

-- DropTable
DROP TABLE "DemandaDetalle";

-- DropTable
DROP TABLE "Entrega";

-- DropTable
DROP TABLE "Jornada";

-- DropTable
DROP TABLE "Lote";

-- DropTable
DROP TABLE "Optimizacion";

-- DropTable
DROP TABLE "Permiso";

-- DropTable
DROP TABLE "Planificacion";

-- DropTable
DROP TABLE "PresentacionProducto";

-- DropTable
DROP TABLE "Producto";

-- DropTable
DROP TABLE "PuntoEntregaContrato";

-- DropTable
DROP TABLE "Rol";

-- DropTable
DROP TABLE "RolPermiso";

-- DropTable
DROP TABLE "Ruta";

-- DropTable
DROP TABLE "Sector";

-- DropTable
DROP TABLE "SectorPunto";

-- DropTable
DROP TABLE "Stock";

-- DropTable
DROP TABLE "Usuario";

-- DropTable
DROP TABLE "UsuarioRol";

-- DropTable
DROP TABLE "Vehiculo";

-- DropTable
DROP TABLE "VentanaEntrega";

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentacion_producto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidades" INTEGER NOT NULL,
    "pesoKg" DECIMAL(12,3),
    "volumenM3" DECIMAL(12,6),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentacion_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoContrato" NOT NULL DEFAULT 'BORRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "punto_entrega_contrato" (
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

    CONSTRAINT "punto_entrega_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventana_entrega" (
    "id" TEXT NOT NULL,
    "puntoEntregaContratoId" TEXT NOT NULL,
    "diaSemana" INTEGER,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "ventana_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornada" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "codigo" TEXT,
    "estado" "EstadoJornada" NOT NULL DEFAULT 'ABIERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demanda" (
    "id" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "puntoEntregaContratoId" TEXT NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demanda_detalle" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "demanda_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacen" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote" (
    "id" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),

    CONSTRAINT "lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadDisponible" DECIMAL(12,3) NOT NULL,
    "cantidadReservada" DECIMAL(12,3) NOT NULL DEFAULT 0,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo" (
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

    CONSTRAINT "vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planificacion" (
    "id" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPlanificacion" NOT NULL DEFAULT 'BORRADOR',
    "estrategiaSectorizacion" "TipoEstrategiaSectorizacion",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "algoritmo" "TipoEstrategiaSectorizacion" NOT NULL,
    "centroLatitud" DECIMAL(10,7),
    "centroLongitud" DECIMAL(10,7),
    "parametros" JSONB,

    CONSTRAINT "sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_punto" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "puntoEntregaId" TEXT NOT NULL,

    CONSTRAINT "sector_punto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carga" (
    "id" TEXT NOT NULL,
    "planificacionId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "pesoTotalKg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "volumenTotalM3" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruta" (
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

    CONSTRAINT "ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega" (
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

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimizacion" (
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

    CONSTRAINT "optimizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_estado_idx" ON "usuario"("estado");

-- CreateIndex
CREATE INDEX "usuario_createdAt_idx" ON "usuario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "producto_codigo_key" ON "producto"("codigo");

-- CreateIndex
CREATE INDEX "producto_nombre_idx" ON "producto"("nombre");

-- CreateIndex
CREATE INDEX "producto_estado_idx" ON "producto"("estado");

-- CreateIndex
CREATE INDEX "presentacion_producto_productoId_idx" ON "presentacion_producto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_codigo_key" ON "contrato"("codigo");

-- CreateIndex
CREATE INDEX "contrato_estado_idx" ON "contrato"("estado");

-- CreateIndex
CREATE INDEX "contrato_fechaInicio_fechaFin_idx" ON "contrato"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "punto_entrega_contrato_contratoId_idx" ON "punto_entrega_contrato"("contratoId");

-- CreateIndex
CREATE INDEX "punto_entrega_contrato_latitud_longitud_idx" ON "punto_entrega_contrato"("latitud", "longitud");

-- CreateIndex
CREATE UNIQUE INDEX "punto_entrega_contrato_contratoId_codigo_key" ON "punto_entrega_contrato"("contratoId", "codigo");

-- CreateIndex
CREATE INDEX "ventana_entrega_puntoEntregaContratoId_idx" ON "ventana_entrega"("puntoEntregaContratoId");

-- CreateIndex
CREATE INDEX "jornada_fecha_idx" ON "jornada"("fecha");

-- CreateIndex
CREATE INDEX "jornada_estado_idx" ON "jornada"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "jornada_contratoId_fecha_key" ON "jornada"("contratoId", "fecha");

-- CreateIndex
CREATE INDEX "demanda_jornadaId_idx" ON "demanda"("jornadaId");

-- CreateIndex
CREATE INDEX "demanda_puntoEntregaContratoId_idx" ON "demanda"("puntoEntregaContratoId");

-- CreateIndex
CREATE UNIQUE INDEX "demanda_jornadaId_puntoEntregaContratoId_key" ON "demanda"("jornadaId", "puntoEntregaContratoId");

-- CreateIndex
CREATE INDEX "demanda_detalle_productoId_idx" ON "demanda_detalle"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "demanda_detalle_demandaId_productoId_key" ON "demanda_detalle"("demandaId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "almacen_codigo_key" ON "almacen"("codigo");

-- CreateIndex
CREATE INDEX "lote_productoId_idx" ON "lote"("productoId");

-- CreateIndex
CREATE INDEX "lote_fechaVencimiento_idx" ON "lote"("fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "lote_almacenId_codigo_key" ON "lote"("almacenId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "stock_almacenId_productoId_key" ON "stock"("almacenId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_placa_key" ON "vehiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_codigo_key" ON "vehiculo"("codigo");

-- CreateIndex
CREATE INDEX "vehiculo_estado_idx" ON "vehiculo"("estado");

-- CreateIndex
CREATE INDEX "planificacion_jornadaId_idx" ON "planificacion"("jornadaId");

-- CreateIndex
CREATE INDEX "planificacion_estado_idx" ON "planificacion"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "sector_planificacionId_codigo_key" ON "sector"("planificacionId", "codigo");

-- CreateIndex
CREATE INDEX "sector_punto_sectorId_idx" ON "sector_punto"("sectorId");

-- CreateIndex
CREATE INDEX "sector_punto_puntoEntregaId_idx" ON "sector_punto"("puntoEntregaId");

-- CreateIndex
CREATE INDEX "carga_planificacionId_idx" ON "carga"("planificacionId");

-- CreateIndex
CREATE INDEX "carga_vehiculoId_idx" ON "carga"("vehiculoId");

-- CreateIndex
CREATE INDEX "ruta_planificacionId_idx" ON "ruta"("planificacionId");

-- CreateIndex
CREATE INDEX "ruta_vehiculoId_idx" ON "ruta"("vehiculoId");

-- CreateIndex
CREATE INDEX "ruta_estado_idx" ON "ruta"("estado");

-- CreateIndex
CREATE INDEX "entrega_puntoEntregaId_idx" ON "entrega"("puntoEntregaId");

-- CreateIndex
CREATE INDEX "entrega_demandaId_idx" ON "entrega"("demandaId");

-- CreateIndex
CREATE UNIQUE INDEX "entrega_rutaId_orden_key" ON "entrega"("rutaId", "orden");

-- CreateIndex
CREATE INDEX "optimizacion_planificacionId_idx" ON "optimizacion"("planificacionId");

-- CreateIndex
CREATE INDEX "optimizacion_estado_idx" ON "optimizacion"("estado");

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentacion_producto" ADD CONSTRAINT "presentacion_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "punto_entrega_contrato" ADD CONSTRAINT "punto_entrega_contrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventana_entrega" ADD CONSTRAINT "ventana_entrega_puntoEntregaContratoId_fkey" FOREIGN KEY ("puntoEntregaContratoId") REFERENCES "punto_entrega_contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornada" ADD CONSTRAINT "jornada_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demanda" ADD CONSTRAINT "demanda_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "jornada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demanda" ADD CONSTRAINT "demanda_puntoEntregaContratoId_fkey" FOREIGN KEY ("puntoEntregaContratoId") REFERENCES "punto_entrega_contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demanda_detalle" ADD CONSTRAINT "demanda_detalle_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demanda_detalle" ADD CONSTRAINT "demanda_detalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planificacion" ADD CONSTRAINT "planificacion_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "jornada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planificacion" ADD CONSTRAINT "planificacion_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector" ADD CONSTRAINT "sector_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_punto" ADD CONSTRAINT "sector_punto_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carga" ADD CONSTRAINT "carga_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carga" ADD CONSTRAINT "carga_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta" ADD CONSTRAINT "ruta_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta" ADD CONSTRAINT "ruta_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "carga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta" ADD CONSTRAINT "ruta_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimizacion" ADD CONSTRAINT "optimizacion_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
