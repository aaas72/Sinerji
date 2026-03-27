import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BadgeService {
    async getAllBadges() {
        return prisma.badge.findMany();
    }

    async createBadge(name: string, iconUrl?: string) {
        return prisma.badge.create({
            data: { name, icon_url: iconUrl }
        });
    }
}
