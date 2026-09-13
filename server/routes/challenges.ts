import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all published challenges
router.get('/', authenticateToken, async (req, res) => {
    const { status, search } = req.query;
    try {
        const where: any = {};
        if (status) where.status = status;
        if (search) where.title = { contains: search as string, mode: 'insensitive' };

        const challenges = await prisma.challenge.findMany({
            where,
            include: { department: true, kpis: true, requirements: true }
        });
        res.json(challenges);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to find challenges' });
    }
});

// Create new challenge
router.post('/', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { title, description, targetValue } = req.body;
    let { departmentId } = req.body;
    try {
        if (!departmentId) {
            const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
            departmentId = user?.departmentId;
        }

        const challenge = await prisma.challenge.create({
            data: { title, description, departmentId, targetValue, status: 'PUBLISHED' }
        });
        await prisma.auditLog.create({ data: { action: 'CHALLENGE_CREATED', entity: challenge.id, userId: req.user?.userId } });
        res.json(challenge);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to create' });
    }
});

// Create AI Copilot Draft
router.post('/ai-copilot', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req, res) => {
    const { problem } = req.body;

    // Simulating structured LLM response based on prompt. This abstraction allows swapping with live Gemini/OpenAI API later.
    setTimeout(() => {
        res.json({
            problem: `Synthesized Problem Statement derived from: "${problem && problem.substring(0, 50)}...". Existing legacy operations result in severe cascading inefficiencies and untracked OPEX bloat due to static scheduling constraints.`,
            outcome: "Deploy a telemetry-based AI-routing system ensuring optimized resource allocation, dynamic scaling, and immediate reduction in negative metric variance.",
            baseline: "Current operational baseline registers 18% error incidence against SLA definitions with high reactive maintenance costs.",
            target: "20% OPEX reduction, >98% SLA compliance",
            duration: "6 Months",
            kpis: ["Efficiency Index (%)", "Cost Reduction Variance (%)", "Sensor Uptime (%)"],
            risks: ["Hardware vandalism in remote zones", "Intermittent network latency affecting telemetry"]
        });
    }, 1500);
});

// Get specific challenge
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const challenge = await prisma.challenge.findUnique({
            where: { id: req.params.id },
            include: { department: true, kpis: true, requirements: true }
        });
        if (!challenge) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(challenge);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to fetch challenge' });
    }
});

// Startup applies to a challenge
router.post('/:id/apply', authenticateToken, requireRole(['Startup']), async (req: AuthRequest, res) => {
    const challengeId = req.params.id;

    // Fetch the caller startup ID using their user relation
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    if (!user || !user.startupId) {
        return res.status(400).json({ error: 'No associated startup found for this user' });
    }

    try {
        const application = await prisma.application.create({
            data: {
                challengeId,
                startupId: user.startupId,
                status: 'Applied'
            }
        });
        await prisma.auditLog.create({
            data: { action: 'STARTUP_APPLIED', entity: application.id, userId: req.user?.userId }
        });
        res.json(application);
    } catch (_e) {
        res.status(500).json({ error: 'Failed to apply' });
    }
});

export default router;
