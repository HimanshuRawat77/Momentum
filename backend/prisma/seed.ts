import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Intentionally empty: we do not seed demo tasks.
  // Each user should only see tasks they create.
  console.log('No seed data inserted.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
