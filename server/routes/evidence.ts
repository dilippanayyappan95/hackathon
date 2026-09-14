import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get all evidence in the vault
router.get('/', authenticateToken, async (req, res) => {
    const { pilotId, status, type, search } = req.query;
    try {
        const where: any = {};
        if (pilotId && pilotId !== 'ALL') where.pilotId = pilotId as string;
        if (status && status !== 'ALL') where.verifiedStatus = status as string;
        if (type && type !== 'ALL') where.fileType = { contains: type as string, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { fileUrl: { contains: search as string, mode: 'insensitive' } },
                { pilot: { startup: { name: { contains: search as string, mode: 'insensitive' } } } },
                { pilot: { challenge: { title: { contains: search as string, mode: 'insensitive' } } } }
            ];
        }

        const evidence = await prisma.evidence.findMany({
            where,
            include: {
                pilot: { include: { startup: true, challenge: { include: { department: true } } } },
                uploadedBy: true,
                kpi: true,
                milestone: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = evidence.map(e => ({
            ...e,
            startupName: e.pilot?.startup?.name || 'Innovation Partner',
            pilotTitle: e.pilot?.challenge?.title || 'Pilot Deployment',
            departmentName: e.pilot?.challenge?.department?.name || 'Municipal Department',
            uploaderName: e.uploadedBy?.name || 'Nodal User'
        }));

        res.json(formatted);
    } catch (e) {
        console.error('[Get Evidence Error]:', e);
        res.status(500).json({ error: 'Failed to fetch evidence records' });
    }
});

// Upload / register new evidence artifact (supporting both /pilot/:pilotId and POST /)
const handleEvidenceUpload = async (req: AuthRequest, res: any) => {
    const { title, description, fileUrl, fileType, kpiId, milestoneId } = req.body;
    const pilotId = req.params.pilotId || req.body.pilotId;

    if (!pilotId) {
        return res.status(400).json({ error: 'Pilot ID is required' });
    }

    if (!fileUrl && !title) {
        return res.status(400).json({ error: 'Evidence title or file reference is required' });
    }

    try {
        const evidence = await prisma.evidence.create({
            data: {
                pilotId,
                title: title || fileUrl,
                description: description || 'Submitted pilot evidence artifact',
                fileUrl: fileUrl || title || 'evidence_artifact.pdf',
                fileType: fileType || 'PDF Report',
                verifiedStatus: 'SUBMITTED',
                uploadedById: req.user!.userId,
                kpiId: kpiId || undefined,
                milestoneId: milestoneId || undefined
            },
            include: { pilot: { include: { startup: true, challenge: true } }, uploadedBy: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'EVIDENCE_SUBMITTED',
                entity: 'Evidence',
                entityId: evidence.id,
                userId: req.user?.userId,
                details: JSON.stringify({
                    title: evidence.title,
                    pilot: evidence.pilot.challenge.title,
                    startup: evidence.pilot.startup.name
                })
            }
        });

        res.status(201).json(evidence);
    } catch (e) {
        console.error('[Upload Evidence Error]:', e);
        res.status(500).json({ error: 'Failed to upload evidence artifact' });
    }
};

router.post('/pilot/:pilotId', authenticateToken, requireRole(['Startup', 'Government Officer', 'Admin']), handleEvidenceUpload);
router.post('/', authenticateToken, requireRole(['Startup', 'Government Officer', 'Admin']), handleEvidenceUpload);

// Verify or reject evidence
router.patch('/:id/verify', authenticateToken, requireRole(['Validator', 'Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const status = (req.body.verifiedStatus || req.body.status || 'VERIFIED').toUpperCase();
    const comments = req.body.reviewComments || req.body.comments || 'Evidence verified against statutory standards.';
    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid verification status' });
    }

    try {
        const evidence = await prisma.evidence.update({
            where: { id: req.params.id },
            data: {
                verifiedStatus: status,
                reviewComments: comments,
                reviewerId: req.user!.userId
            },
            include: { pilot: { include: { startup: true, challenge: true } } }
        });

        await prisma.auditLog.create({
            data: {
                action: `EVIDENCE_${status}`,
                entity: 'Evidence',
                entityId: evidence.id,
                userId: req.user?.userId,
                details: JSON.stringify({
                    title: evidence.title,
                    status,
                    reviewerId: req.user!.userId,
                    comments
                })
            }
        });

        res.json(evidence);
    } catch (e) {
        console.error('[Verify Evidence Error]:', e);
        res.status(500).json({ error: 'Failed to verify evidence' });
    }
});

export default router;
