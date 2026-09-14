import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get validation records
router.get('/', authenticateToken, async (req, res) => {
    const { pilotId, decision } = req.query;
    try {
        const where: any = {};
        if (pilotId && pilotId !== 'ALL') where.pilotId = pilotId as string;
        if (decision && decision !== 'ALL') where.decision = decision as string;

        const records = await prisma.validationRecord.findMany({
            where,
            include: {
                pilot: {
                    include: {
                        startup: true,
                        challenge: { include: { department: true } },
                        kpis: true,
                        evidence: true
                    }
                },
                validator: true
            },
            orderBy: { timestamp: 'desc' }
        });

        res.json(records);
    } catch (e) {
        console.error('[Get Validation Records Error]:', e);
        res.status(500).json({ error: 'Failed to fetch validation records' });
    }
});

// Submit Independent Validation finding & verdict
router.post('/', authenticateToken, requireRole(['Validator', 'Admin']), async (req: AuthRequest, res) => {
    const { pilotId, decision, methodology, findings, confidence, comments } = req.body;

    if (!pilotId) {
        return res.status(400).json({ error: 'Pilot ID is required' });
    }

    const validDecisions = ['VALIDATED', 'PARTIALLY_VALIDATED', 'REJECTED', 'IN_REVIEW', 'PENDING'];
    if (!validDecisions.includes(decision)) {
        return res.status(400).json({ error: 'Invalid validation decision' });
    }

    try {
        const record = await prisma.validationRecord.create({
            data: {
                pilotId,
                validatorId: req.user!.userId,
                decision,
                methodology: methodology || 'Independent telemetry dataset verification and statistical significance audit.',
                findings: findings || 'Verification audit complete against baseline and target criteria.',
                confidence: confidence || 'High',
                comments: comments || 'Validation sign-off recorded for sovereign procurement ledger.'
            },
            include: {
                pilot: { include: { startup: true, challenge: { include: { department: true } }, kpis: true, evidence: true } },
                validator: true
            }
        });

        // Update pilot status if validated or failed
        if (decision === 'VALIDATED') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'COMPLETED' }
            });

            // Mark all submitted evidence on this pilot as VERIFIED
            await prisma.evidence.updateMany({
                where: { pilotId, verifiedStatus: 'SUBMITTED' },
                data: { verifiedStatus: 'VERIFIED', reviewerId: req.user!.userId }
            });
        } else if (decision === 'REJECTED') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'FAILED' }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: `PILOT_VALIDATION_${decision}`,
                entity: 'ValidationRecord',
                entityId: record.id,
                userId: req.user!.userId,
                details: JSON.stringify({
                    pilot: record.pilot.challenge.title,
                    startup: record.pilot.startup.name,
                    decision,
                    confidence
                })
            }
        });

        res.json(record);
    } catch (e) {
        console.error('[Submit Validation Error]:', e);
        res.status(500).json({ error: 'Failed to record validation' });
    }
});

export default router;
