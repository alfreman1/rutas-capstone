const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.usuario.findUnique({
    where: { email: 'admin@logistica.local' },
    include: { usuarios: { include: { rol: true } } }
  });
  console.log(JSON.stringify(u, null, 2));
}
main().finally(() => prisma.$disconnect());
