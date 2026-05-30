import prisma from '../lib/prisma';



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
