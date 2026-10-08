import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding...');

  // 1. Limpiar base de datos (Opcional, con cuidado)
  // await prisma.usuario.deleteMany();
  // await prisma.rol.deleteMany();

  // 2. Crear Permisos
  const permisosData = [
    { codigo: 'MANAGE_USERS', nombre: 'Gestionar Usuarios', descripcion: 'Permite crear, editar y eliminar usuarios' },
    { codigo: 'MANAGE_VEHICLES', nombre: 'Gestionar Vehículos', descripcion: 'Permite gestionar la flota' },
    { codigo: 'MANAGE_CONTRACTS', nombre: 'Gestionar Contratos', descripcion: 'Permite gestionar contratos y puntos de entrega' },
    { codigo: 'MANAGE_PLANS', nombre: 'Gestionar Planificaciones', descripcion: 'Permite crear y optimizar rutas' },
    { codigo: 'VIEW_REPORTS', nombre: 'Ver Reportes', descripcion: 'Permite visualizar reportes' }
  ];

  const permisosMap = new Map();
  for (const p of permisosData) {
    const permiso = await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
    permisosMap.set(p.codigo, permiso.id);
  }

  // 3. Crear Roles con sus Permisos
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del Sistema Logístico',
      permisos: {
        create: Array.from(permisosMap.values()).map(id => ({ permisoId: id }))
      }
    },
  });

  const rolDispatcher = await prisma.rol.upsert({
    where: { nombre: 'DISPATCHER' },
    update: {},
    create: {
      nombre: 'DISPATCHER',
      descripcion: 'Encargado de Planificación y Despachos',
      permisos: {
        create: [
          { permisoId: permisosMap.get('MANAGE_VEHICLES') },
          { permisoId: permisosMap.get('MANAGE_CONTRACTS') },
          { permisoId: permisosMap.get('MANAGE_PLANS') },
          { permisoId: permisosMap.get('VIEW_REPORTS') }
        ]
      }
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

  // 4. Crear Usuario Administrador por defecto
  const passwordHash = await argon2.hash('admin1234');

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@logistica.local' },
    update: {},
    create: {
      email: 'admin@logistica.local',
      password: passwordHash,
      nombre: 'Administrador Principal',
      estado: 'ACTIVO',
      usuarios: {
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
