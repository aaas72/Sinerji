import { Request, Response } from 'express';
import prisma from '../lib/prisma';



export const getStats = async (req: Request, res: Response) => {
    try {
        const [students, companies, tasks, badges] = await Promise.all([
            prisma.user.count({ where: { role: { equals: 'student', mode: 'insensitive' } } }),
            prisma.user.count({ where: { role: { equals: 'company', mode: 'insensitive' } } }),
            prisma.task.count(),
            prisma.awardedBadge.count(),
        ]);

        res.json({
            students,
            companies,
            tasks,
            badges
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getLatestTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            take: 3,
            orderBy: { created_at: 'desc' },
            include: {
                company: {
                    select: { company_name: true }
                },
                requiredSkills: {
                    include: { skill: true }
                }
            }
        });

        const formattedTasks = tasks.map(t => ({
            id: t.id,
            title: t.title,
            company: t.company.company_name,
            skills: t.requiredSkills.map(s => s.skill.name)
        }));

        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const getTopCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await prisma.companyProfile.findMany({
            take: 4,
            orderBy: {
                tasks: {
                    _count: 'desc'
                }
            },
            select: {
                company_name: true,
                logo_url: true,
                industry: true,
                _count: {
                    select: { tasks: true }
                }
            }
        });

        const formattedCompanies = companies.map(c => ({
            name: c.company_name,
            logo_url: c.logo_url,
            industry: c.industry,
            taskCount: c._count.tasks
        }));

        res.json(formattedCompanies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top companies' });
    }
};
