import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const evals = await prisma.evaluation.findMany({
            include: { application: { include: { startup: true, challenge: true } } }
        });
        res.json(evals);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
});

router.post('/', authenticateToken, requireRole(['Expert', 'Admin', 'Government Officer']), async (req: AuthRequest, res) => {
    const { applicationId, overallScore, scores, comments, conflict } = req.body;

    try {
        const evaluation = await prisma.evaluation.create({
            data: {
                applicationId,
                expertId: req.user!.userId,
                status: 'Submitted',
                overallScore,
                declaredNoConflict: conflict,
                scores: {
                    create: Object.entries(scores).map(([category, score]) => ({ category, score: Number(score), comments }))
                }
            }
        });

        await prisma.auditLog.create({
            data: { action: 'EVALUATION_SUBMITTED', entity: evaluation.id, userId: req.user!.userId }
        });

        // Auto-select application if score is extremely high for demo purposes
        if (overallScore > 75) {
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'Selected' }
            });
        }

        res.json(evaluation);
    } catch (_e) {
        console.error(_e);
        res.status(500).json({ error: 'Failed to submit evaluation' });
    }
});

export default router;
