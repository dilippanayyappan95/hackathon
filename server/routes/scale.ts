import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Handle scale decision
router.post('/', authenticateToken, requireRole(['Admin', 'Government Officer']), async (req: AuthRequest, res) => {
    const { pilotId, recommendation, finalDecision } = req.body;
    try {
        const decision = await prisma.scaleDecision.create({
            data: {
                pilotId,
                decisionById: req.user!.userId,
                recommendation,
                finalDecision
            }
        });

        // Set pilot status up
        if (finalDecision === 'SCALE') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'Completed' }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: `SCALE_DECISION_${finalDecision.replace(' ', '_')}`,
                entity: decision.id,
                userId: req.user!.userId
            }
        });

        res.json(decision);
    } catch {
        res.status(500).json({ error: 'Failed to record scale decision' });
    }
});

/* For Innovation Passport */
router.get('/passport/:pilotId', authenticateToken, async (req, res) => {
    try {
        const pilot = await prisma.pilotProject.findUnique({
            where: { id: req.params.pilotId },
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                evidence: true,
                scaleDecision: true,
                validations: true
            }
        });
        res.json(pilot);
    } catch {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
