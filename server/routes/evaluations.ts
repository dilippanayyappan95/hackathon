import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get evaluations list
router.get('/', authenticateToken, async (req, res) => {
    const { applicationId } = req.query;
    try {
        const where: any = {};
        if (applicationId) where.applicationId = applicationId as string;

        const evals = await prisma.evaluation.findMany({
            where,
            include: {
                application: {
                    include: {
                        startup: true,
                        challenge: { include: { department: true } }
                    }
                },
                expert: true,
                scores: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(evals);
    } catch (e) {
        console.error('[Get Evaluations Error]:', e);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
});

// Submit formal expert evaluation
router.post('/', authenticateToken, requireRole(['Expert', 'Admin', 'Government Officer']), async (req: AuthRequest, res) => {
    const { applicationId, scores, comments, conflict, declaredNoConflict } = req.body;

    if (!applicationId) {
        return res.status(400).json({ error: 'Application ID is required' });
    }

    const noConflict = conflict !== undefined ? Boolean(conflict) : Boolean(declaredNoConflict);
    if (!noConflict) {
        return res.status(400).json({ error: 'Must formally declare no conflict of interest' });
    }

    try {
        // Compute weighted overall score
        let weightedSum = 0;
        let totalWeight = 0;

        const defaultWeights: Record<string, number> = {
            'Problem Fit & Alignment': 0.25,
            'Technical Feasibility': 0.20,
            'Cost Effectiveness': 0.15,
            'Scalability': 0.15,
            'Security & Compliance': 0.10,
            'Startup Readiness': 0.10,
            'Sustainability': 0.05,
            // Fallback keys for short keys
            problemFit: 0.25,
            technicalFeasibility: 0.20,
            innovation: 0.15,
            scalability: 0.15,
            costEffectiveness: 0.10,
            security: 0.10,
            riskScore: 0.05,
            teamCapability: 0.10,
            tech: 0.20,
            impact: 0.25,
            cost: 0.15,
            scale: 0.15,
            sec: 0.10,
            ready: 0.10,
            sust: 0.05
        };

        const scoreEntries = Object.entries(scores || {});
        for (const [key, val] of scoreEntries) {
            const weight = defaultWeights[key] || 0.10;
            weightedSum += Number(val) * weight;
            totalWeight += weight;
        }

        const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 80;

        // Create Evaluation
        const evaluation = await prisma.evaluation.create({
            data: {
                applicationId,
                expertId: req.user!.userId,
                status: 'SUBMITTED',
                overallScore,
                comments: comments || 'Evaluation completed according to state innovation procurement guidelines.',
                declaredNoConflict: noConflict,
                scores: {
                    create: scoreEntries.map(([category, score]) => ({
                        category,
                        score: Number(score),
                        weight: defaultWeights[category] || 0.10,
                        comments
                    }))
                }
            },
            include: { application: { include: { startup: true, challenge: true } }, scores: true }
        });

        // Update application status based on evaluation outcome
        if (overallScore >= 75) {
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'SELECTED' }
            });
        } else if (overallScore >= 50) {
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'SHORTLISTED' }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: 'EVALUATION_SUBMITTED',
                entity: 'Evaluation',
                entityId: evaluation.id,
                userId: req.user!.userId,
                details: JSON.stringify({
                    startup: evaluation.application.startup.name,
                    overallScore,
                    expertId: req.user!.userId
                })
            }
        });

        res.status(201).json({
            ...evaluation,
            totalScore: overallScore
        });
    } catch (e) {
        console.error('[Submit Evaluation Error]:', e);
        res.status(500).json({ error: 'Failed to submit evaluation' });
    }
});

export default router;
