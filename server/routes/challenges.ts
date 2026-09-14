import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { AIService } from '../services/aiService';

const router = Router();

// Get all challenges with rich filters
router.get('/', authenticateToken, async (req, res) => {
    const { status, search, departmentId, category } = req.query;
    try {
        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        if (departmentId && departmentId !== 'ALL') {
            where.departmentId = departmentId;
        }
        if (category && category !== 'ALL') {
            where.category = { contains: category as string, mode: 'insensitive' };
        }
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { problemStatement: { contains: search as string, mode: 'insensitive' } },
                { department: { name: { contains: search as string, mode: 'insensitive' } } }
            ];
        }

        const challenges = await prisma.challenge.findMany({
            where,
            include: {
                department: true,
                kpis: true,
                requirements: true,
                applications: { include: { startup: true } },
                pilots: { include: { startup: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = challenges.map(ch => ({
            ...ch,
            applicationsCount: ch.applications.length,
            activePilotsCount: ch.pilots.filter(p => p.status === 'ACTIVE').length
        }));

        res.json(formatted);
    } catch (e) {
        console.error('[Get Challenges Error]:', e);
        res.status(500).json({ error: 'Failed to find challenges' });
    }
});

// AI Copilot Draft Generation
router.post('/ai-copilot', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req, res) => {
    const { problem, department, category, expectedOutcome } = req.body;
    if (!problem) {
        return res.status(400).json({ error: 'Problem description is required for AI Copilot' });
    }

    try {
        const draft = await AIService.generateChallengeCopilot({
            problem,
            department,
            category,
            expectedOutcome
        });
        res.json(draft);
    } catch (e) {
        console.error('[AI Copilot Error]:', e);
        res.status(500).json({ error: 'Failed to generate AI Challenge Draft' });
    }
});

// Create new challenge
router.post('/', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const {
        title,
        problemStatement,
        description,
        category,
        location,
        budget,
        timeline,
        targetValue,
        baselineValue,
        requiredCapabilities,
        eligibilityCriteria,
        expectedOutcomes,
        evaluationCriteria,
        status,
        requirements,
        kpis
    } = req.body;

    let { departmentId } = req.body;

    try {
        if (!departmentId) {
            const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
            departmentId = user?.departmentId;
        }

        if (!departmentId) {
            const defaultDept = await prisma.department.findFirst();
            departmentId = defaultDept?.id;
        }

        const challenge = await prisma.challenge.create({
            data: {
                title: title || 'New Innovation Challenge',
                problemStatement: problemStatement || description,
                description: description || problemStatement || '',
                category: category || 'Smart Infrastructure',
                location: location || 'Municipal Sandbox',
                budget: budget || '₹25,00,000',
                timeline: timeline || '6 Months',
                targetValue: targetValue || '20% improvement',
                baselineValue: baselineValue || 'Current operational baseline',
                requiredCapabilities: Array.isArray(requiredCapabilities) ? requiredCapabilities.join('; ') : requiredCapabilities,
                eligibilityCriteria: eligibilityCriteria || 'DPIIT recognized startups with prior pilot deployment experience',
                expectedOutcomes: expectedOutcomes || 'Demonstrate quantifiable improvement against baseline',
                evaluationCriteria: typeof evaluationCriteria === 'string' ? evaluationCriteria : JSON.stringify(evaluationCriteria || []),
                status: status || 'PUBLISHED',
                departmentId,
                requirements: {
                    create: (requirements || [
                        { description: 'Direct departmental API telemetry integration', isMandatory: true },
                        { description: 'Indian sovereign cloud data residency compliance', isMandatory: true }
                    ]).map((r: any) => ({
                        description: typeof r === 'string' ? r : r.description,
                        isMandatory: r.isMandatory !== false
                    }))
                },
                kpis: {
                    create: (kpis || [
                        { name: 'Core Operational Metric', metric: 'Primary KPI', baseline: baselineValue || '100', target: targetValue || '120', unit: 'Units' }
                    ]).map((k: any) => ({
                        name: k.name,
                        metric: k.metric || k.name,
                        baseline: k.baseline || 'Baseline',
                        target: k.target || 'Target',
                        unit: k.unit || '%'
                    }))
                }
            },
            include: { department: true, requirements: true, kpis: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CHALLENGE_CREATED',
                entity: 'Challenge',
                entityId: challenge.id,
                userId: req.user?.userId,
                details: JSON.stringify({ title: challenge.title, status: challenge.status })
            }
        });

        res.json(challenge);
    } catch (e) {
        console.error('[Create Challenge Error]:', e);
        res.status(500).json({ error: 'Failed to create challenge' });
    }
});

// Get specific challenge by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const challenge = await prisma.challenge.findUnique({
            where: { id: req.params.id },
            include: {
                department: true,
                kpis: true,
                requirements: true,
                applications: {
                    include: {
                        startup: true,
                        evaluations: { include: { expert: true, scores: true } }
                    }
                },
                pilots: {
                    include: {
                        startup: true,
                        kpis: true,
                        milestones: true,
                        validations: true,
                        passports: true,
                        scaleDecision: true
                    }
                }
            }
        });

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.json({
            ...challenge,
            applicationsCount: challenge.applications.length
        });
    } catch (e) {
        console.error('[Get Challenge Detail Error]:', e);
        res.status(500).json({ error: 'Failed to fetch challenge details' });
    }
});

// Update challenge
router.patch('/:id', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { title, description, problemStatement, budget, timeline, targetValue, baselineValue, category, location, status } = req.body;
    try {
        const updated = await prisma.challenge.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                problemStatement,
                budget,
                timeline,
                targetValue,
                baselineValue,
                category,
                location,
                status
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CHALLENGE_UPDATED',
                entity: 'Challenge',
                entityId: updated.id,
                userId: req.user?.userId,
                details: JSON.stringify(req.body)
            }
        });

        res.json(updated);
    } catch (e) {
        console.error('[Update Challenge Error]:', e);
        res.status(500).json({ error: 'Failed to update challenge' });
    }
});

// Update status
router.patch('/:id/status', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'PUBLISHED', 'UNDER_EVALUATION', 'PILOT', 'COMPLETED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid challenge status' });
    }

    try {
        const updated = await prisma.challenge.update({
            where: { id: req.params.id },
            data: { status }
        });

        await prisma.auditLog.create({
            data: {
                action: `CHALLENGE_STATUS_${status}`,
                entity: 'Challenge',
                entityId: updated.id,
                userId: req.user?.userId,
                details: JSON.stringify({ oldStatus: updated.status, newStatus: status })
            }
        });

        res.json(updated);
    } catch (e) {
        console.error('[Update Status Error]:', e);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Startup applies to a challenge
router.post('/:id/apply', authenticateToken, requireRole(['Startup']), async (req: AuthRequest, res) => {
    const challengeId = req.params.id;
    const { solutionSummary, proposedBudget, proposedTimeline } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    if (!user || !user.startupId) {
        return res.status(400).json({ error: 'No associated startup profile found for this account' });
    }

    try {
        // Prevent duplicate application
        const existing = await prisma.application.findFirst({
            where: { challengeId, startupId: user.startupId }
        });

        if (existing) {
            return res.status(400).json({ error: 'An application has already been submitted for this challenge.' });
        }

        const startup = await prisma.startup.findUnique({ where: { id: user.startupId } });

        const application = await prisma.application.create({
            data: {
                challengeId,
                startupId: user.startupId,
                solutionSummary: solutionSummary || startup?.description || 'Proposed solution for sovereign innovation challenge.',
                proposedBudget: proposedBudget || '₹25,00,000',
                proposedTimeline: proposedTimeline || '6 Months',
                status: 'SUBMITTED'
            },
            include: { challenge: true, startup: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'APPLICATION_SUBMITTED',
                entity: 'Application',
                entityId: application.id,
                userId: req.user?.userId,
                details: JSON.stringify({ startup: startup?.name, challengeId })
            }
        });

        res.json(application);
    } catch (e) {
        console.error('[Apply Challenge Error]:', e);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

export default router;
