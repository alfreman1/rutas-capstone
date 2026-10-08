import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding de Datos de Prueba para Optimización...');

  // 1. Limpieza inicial (opcional, comentar si se prefiere no borrar)
  console.log('Limpiando tablas de prueba...');
  await prisma.demandaDetalle.deleteMany();
  await prisma.demanda.deleteMany();
  await prisma.planificacion.deleteMany();
  await prisma.jornada.deleteMany();
  await prisma.ventanaEntrega.deleteMany();
  await prisma.puntoEntregaContrato.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.contrato.deleteMany();
  await prisma.presentacionProducto.deleteMany();
  await prisma.producto.deleteMany();
  
  // 2. Crear Productos
  console.log('Creando productos...');
  const prod1 = await prisma.producto.create({
    data: { codigo: 'PRD-001', nombre: 'Caja Estándar' }
  });
  
  const pProd1 = await prisma.presentacionProducto.create({
    data: {
      productoId: prod1.id,
      nombre: 'Caja de 10kg',
      unidades: 1,
      pesoKg: 10.0,
      volumenM3: 0.05
    }
  });

  // 3. Crear Vehículos
  console.log('Creando vehículos...');
  const vehiculos = [];
  for (let i = 1; i <= 3; i++) {
    vehiculos.push(await prisma.vehiculo.create({
      data: {
        codigo: `VEH-00${i}`,
        placa: `ABC-00${i}`,
        marca: 'Hino',
        modelo: 'Serie 500',
        tipo: 'CAMION',
        capacidadPesoKg: 5000,
        capacidadVolumenM3: 20,
        estado: 'ACTIVO'
      }
    }));
  }

  // 4. Crear Contrato
  console.log('Creando contrato base...');
  const contrato = await prisma.contrato.create({
    data: {
      codigo: 'CTR-DEMO',
      nombre: 'Contrato de Distribución Demo',
      fechaInicio: new Date(),
      estado: 'ACTIVO'
    }
  });

  // 5. Crear Puntos de Entrega (Coordenadas de ejemplo alrededor de un centro ficticio)
  console.log('Creando puntos de entrega...');
  const puntos = [
    { nombre: 'Supermercado A', lat: -16.5000, lng: -68.1190 },
    { nombre: 'Mercado B', lat: -16.5020, lng: -68.1200 },
    { nombre: 'Tienda C', lat: -16.4950, lng: -68.1150 },
    { nombre: 'Almacén D', lat: -16.5100, lng: -68.1250 },
    { nombre: 'Local E', lat: -16.4900, lng: -68.1100 }
  ];

  const dbPuntos = [];
  for (let i = 0; i < puntos.length; i++) {
    const p = await prisma.puntoEntregaContrato.create({
      data: {
        contratoId: contrato.id,
        codigo: `PNT-00${i+1}`,
        nombre: puntos[i].nombre,
        latitud: puntos[i].lat,
        longitud: puntos[i].lng,
        tiempoServicioMinutos: 15,
        estado: 'ACTIVO',
        ventanas: {
          create: [{
            horaInicio: new Date('1970-01-01T08:00:00.000Z'),
            horaFin: new Date('1970-01-01T12:00:00.000Z')
          }]
        }
      }
    });
    dbPuntos.push(p);
  }

  // 6. Crear Jornada
  console.log('Creando jornada...');
  const jornada = await prisma.jornada.create({
    data: {
      contratoId: contrato.id,
      fecha: new Date(),
      estado: 'ABIERTA'
    }
  });

  // 7. Crear Demandas para la Jornada
  console.log('Creando demandas...');
  for (const p of dbPuntos) {
    const demanda = await prisma.demanda.create({
      data: {
        jornadaId: jornada.id,
        puntoEntregaContratoId: p.id
      }
    });

    await prisma.demandaDetalle.create({
      data: {
        demandaId: demanda.id,
        productoId: prod1.id,
        cantidad: Math.floor(Math.random() * 50) + 10 // Entre 10 y 60 cajas
      }
    });
  }

  // 8. Crear Planificación
  console.log('Creando planificación en borrador...');
  const planificacion = await prisma.planificacion.create({
    data: {
      jornadaId: jornada.id,
      estado: 'BORRADOR'
    }
  });

  console.log('--------------------------------------------------');
  console.log('¡Seeding de prueba completado exitosamente!');
  console.log(`Vehículos creados: ${vehiculos.length}`);
  console.log(`Puntos de entrega: ${dbPuntos.length}`);
  console.log(`Planificación ID : ${planificacion.id}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
