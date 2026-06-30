import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting is_verified = true for all students...");
  await prisma.studentProfile.updateMany({
    data: { 
      is_verified: true,
      sub_merchant_key: "TR000000000000000000000000"
    }
  });
  console.log("Students verified successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
