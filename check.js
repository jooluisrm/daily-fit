const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst();
  console.log('REST TIME:', u.restTimeGoal);
}

main().finally(() => prisma.$disconnect());
