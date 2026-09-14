import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get audit logs
router.get('/', authenticateToken, async (req, res) => {
    const { entity, action, limit } = req.query;
    try {
        const where: any = {};
        if (entity && entity !== 'ALL') where.entity = entity as string;
        if (action && action !== 'ALL') where.action = { contains: action as string, mode: 'insensitive' };

        const logs = await prisma.auditLog.findMany({
            where,
            take: limit ? parseInt(limit as string, 10) : 50,
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: { select: { name: true } }
                    }
                }
            }
        });

        res.json(logs);
    } catch (e) {
        console.error('[Get Audit Logs Error]:', e);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
