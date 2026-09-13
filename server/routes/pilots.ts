import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all pilots with relations
router.get('/', authenticateToken, async (req, res) => {
    const { status, search } = req.query;
    try {
        const where: any = {};
        if (status) where.status = typeof status === 'string' && status.toLowerCase() === 'active' ? { in: ['Active', 'Completed'] } : status; // Handle frontend asking for active easily

        const pilots = await prisma.pilotProject.findMany({
            where,
            include: { startup: true, challenge: true, kpis: true, evidence: true }
        });

        let filtered = pilots;
        if (search) {
            const term = (search as string).toLowerCase();
            filtered = pilots.filter(p => p.startup.name.toLowerCase().includes(term) || p.challenge.title.toLowerCase().includes(term));
        }

        res.json(filtered);
    } catch {
        res.status(500).json({ error: 'Failed to fetch pilots' });
    }
});

// Upload evidence to Pilot (simulating Digital Vault action)
router.post('/:id/evidence', authenticateToken, requireRole(['Startup', 'Government Officer']), async (req: AuthRequest, res) => {
    const { fileUrl, fileType, kpiId } = req.body;
    try {
        const evidence = await prisma.evidence.create({
            data: {
                pilotId: req.params.id,
                uploadedById: req.user!.userId,
                fileUrl,
                fileType: fileType || 'Pilot Report',
                verifiedStatus: 'Pending',
                kpiId
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'EVIDENCE_UPLOAD',
                entity: evidence.id,
                userId: req.user!.userId
            }
        });

        res.json(evidence);
    } catch {
        res.status(500).json({ error: 'Failed to upload evidence' });
    }
});

// Validate Evidence
router.patch('/evidence/:id/validate', authenticateToken, requireRole(['Admin', 'Validator']), async (req: AuthRequest, res) => {
    const { status } = req.body;
    try {
        const evidence = await prisma.evidence.update({
            where: { id: req.params.id },
            data: { verifiedStatus: status }
        });

        await prisma.auditLog.create({
            data: {
                action: `EVIDENCE_${status.toUpperCase().replace(' ', '_')}`,
                entity: evidence.id,
                userId: req.user!.userId
            }
        });

        res.json(evidence);
    } catch {
        res.status(500).json({ error: 'Failed to validate evidence' });
    }
});

export default router;
