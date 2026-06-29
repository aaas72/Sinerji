const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.submission.updateMany({
    data: {
      status: 'pending',
      payment_status: 'unpaid'
    },
  });
  console.log(`Reset ${result.count} submissions to pending status.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
