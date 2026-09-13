import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get applications
router.get('/', authenticateToken, async (req, res) => {
    const { challengeId, status } = req.query;
    try {
        const where: any = {};
        if (challengeId) where.challengeId = challengeId;
        if (status) where.status = status;

        const applications = await prisma.application.findMany({
            where,
            include: { challenge: true, startup: true }
        });
        res.json(applications);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Update application status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
        const application = await prisma.application.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(application);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to update application' });
    }
});

export default router;
