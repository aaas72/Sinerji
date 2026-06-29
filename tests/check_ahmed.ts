import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const ahmed = await prisma.studentProfile.findFirst({
        where: { full_name: { contains: 'Yilmaz', mode: 'insensitive' } },
        include: { user: true }
    });

    if (ahmed) {
        console.log(`Found: ${ahmed.full_name}`);
        console.log(`Email: ${ahmed.user.email}`);
        console.log(`Verified: ${ahmed.is_verified}`);
        console.log(`IBAN: ${ahmed.sub_merchant_key}`);
    } else {
        console.log("Ahmed Yilmaz not found.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
