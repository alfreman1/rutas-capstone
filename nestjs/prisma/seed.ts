import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding...');

  // 1. Limpiar base de datos (Opcional, con cuidado)
  // await prisma.usuario.deleteMany();
  // await prisma.rol.deleteMany();

  // 2. Crear Roles
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del Sistema Logístico',
    },
  });

  const rolDispatcher = await prisma.rol.upsert({
    where: { nombre: 'DISPATCHER' },
    update: {},
    create: {
      nombre: 'DISPATCHER',
      descripcion: 'Encargado de Planificación y Despachos',
    },
  });

  const rolDriver = await prisma.rol.upsert({
    where: { nombre: 'DRIVER' },
    update: {},
    create: {
      nombre: 'DRIVER',
      descripcion: 'Conductor de la flota',
    },
  });

  // 3. Crear Usuario Administrador por defecto
  const passwordHash = await argon2.hash('admin1234');

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@logistica.local' },
    update: {},
    create: {
      email: 'admin@logistica.local',
      password: passwordHash,
      nombre: 'Administrador Principal',
      apellidos: 'LogiRoute',
      telefono: '+591 70000000',
      estado: 'ACTIVO',
      roles: {
        create: [
          { rolId: rolAdmin.id }
        ]
      }
    },
  });

  console.log('Seeding completado con éxito.');
  console.log('-------------------------------------------');
  console.log('Usuario: admin@logistica.local');
  console.log('Clave:   admin1234');
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
