import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get applications with filtering
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    const { challengeId, startupId, status } = req.query;
    try {
        const where: any = {};
        if (challengeId && challengeId !== 'ALL') where.challengeId = challengeId;
        if (startupId && startupId !== 'ALL') where.startupId = startupId;
        if (status && status !== 'ALL') where.status = status;

        const applications = await prisma.application.findMany({
            where,
            include: {
                challenge: { include: { department: true } },
                startup: true,
                evaluations: { include: { expert: true, scores: true } },
                pilots: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(applications);
    } catch (e) {
        console.error('[Get Applications Error]:', e);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Create new application
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    let { challengeId, startupId, solutionSummary, proposal, proposedBudget, proposedTimeline } = req.body;
    try {
        if (!startupId) {
            const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
            startupId = user?.startupId;
        }

        if (!startupId) {
            const defaultStartup = await prisma.startup.findFirst();
            startupId = defaultStartup?.id;
        }

        if (!challengeId) {
            return res.status(400).json({ error: 'Challenge ID is required' });
        }

        // Check if application exists
        const existing = await prisma.application.findFirst({
            where: { challengeId, startupId }
        });

        if (existing) {
            return res.json(existing);
        }

        const startup = await prisma.startup.findUnique({ where: { id: startupId } });

        const application = await prisma.application.create({
            data: {
                challengeId,
                startupId,
                solutionSummary: solutionSummary || proposal || startup?.description || 'Proposed solution for sovereign innovation challenge.',
                proposedBudget: typeof proposedBudget === 'number' ? `₹${proposedBudget.toLocaleString('en-IN')}` : proposedBudget || '₹25,00,000',
                proposedTimeline: proposedTimeline || '90 Days',
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
        console.error('[Create Application Error]:', e);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// Get single application detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const application = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: {
                challenge: { include: { department: true, requirements: true, kpis: true } },
                startup: true,
                evaluations: { include: { expert: true, scores: true } },
                documents: true,
                pilots: true
            }
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(application);
    } catch (e) {
        console.error('[Get Application Detail Error]:', e);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Update application status (Screening / Selection workflow)
router.patch('/:id/status', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { status, rejectionReason } = req.body;
    const validStatuses = [
        'SUBMITTED',
        'ELIGIBILITY_REVIEW',
        'ELIGIBLE',
        'INELIGIBLE',
        'SHORTLISTED',
        'UNDER_EVALUATION',
        'SELECTED',
        'REJECTED'
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid application status' });
    }

    try {
        const application = await prisma.application.update({
            where: { id: req.params.id },
            data: { status, rejectionReason },
            include: { challenge: true, startup: true }
        });

        await prisma.auditLog.create({
            data: {
                action: `APPLICATION_${status}`,
                entity: 'Application',
                entityId: application.id,
                userId: req.user?.userId,
                details: JSON.stringify({ startup: application.startup.name, status, rejectionReason })
            }
        });

        res.json(application);
    } catch (e) {
        console.error('[Update Application Status Error]:', e);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// Create pilot from selected application
router.post('/:id/initiate-pilot', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { pilotLocation, startDate, endDate, objectives, baseline, target } = req.body;
    try {
        const app = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: { challenge: { include: { kpis: true } }, startup: true }
        });

        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Update application status to SELECTED if not already
        await prisma.application.update({
            where: { id: app.id },
            data: { status: 'SELECTED' }
        });

        // Update challenge status to PILOT
        await prisma.challenge.update({
            where: { id: app.challengeId },
            data: { status: 'PILOT' }
        });

        // Create PilotProject
        const pilot = await prisma.pilotProject.create({
            data: {
                challengeId: app.challengeId,
                applicationId: app.id,
                startupId: app.startupId,
                status: 'ACTIVE',
                pilotLocation: pilotLocation || app.challenge.location || 'Municipal Pilot Zone',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(Date.now() + 180 * 24 * 3600 * 1000),
                objectives: objectives || app.challenge.expectedOutcomes || 'Validate technology performance in live municipal environment',
                baseline: baseline || app.challenge.baselineValue || 'Baseline operational metric',
                target: target || app.challenge.targetValue || 'Target operational metric',
                ownerId: req.user?.userId,
                // Inherit KPIs from challenge
                kpis: {
                    create: (app.challenge.kpis || []).map(k => ({
                        name: k.name,
                        unit: k.unit || '%',
                        baseline: k.baseline || app.challenge.baselineValue,
                        target: k.target,
                        status: 'ON_TRACK',
                        source: 'Pilot Live Telemetry'
                    }))
                },
                // Default milestones
                milestones: {
                    create: [
                        {
                            title: 'Milestone 1: Deployment & System Integration',
                            description: 'Setup hardware/software and complete API handshake',
                            status: 'IN_PROGRESS',
                            amount: 500000,
                            dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000)
                        },
                        {
                            title: 'Milestone 2: Active Telemetry & Mid-term Performance Review',
                            description: 'Operate in municipal sandbox for 60 days and verify interim metrics',
                            status: 'PENDING',
                            amount: 1000000,
                            dueDate: new Date(Date.now() + 90 * 24 * 3600 * 1000)
                        },
                        {
                            title: 'Milestone 3: Final Verification & Scale Dossier',
                            description: 'Deliver full KPI verification, independent audit, and scale blueprint',
                            status: 'PENDING',
                            amount: 1000000,
                            dueDate: new Date(Date.now() + 180 * 24 * 3600 * 1000)
                        }
                    ]
                }
            },
            include: { startup: true, challenge: true, kpis: true, milestones: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PILOT_INITIATED',
                entity: 'PilotProject',
                entityId: pilot.id,
                userId: req.user?.userId,
                details: JSON.stringify({ startup: app.startup.name, challenge: app.challenge.title, pilotId: pilot.id })
            }
        });

        res.json(pilot);
    } catch (e) {
        console.error('[Initiate Pilot Error]:', e);
        res.status(500).json({ error: 'Failed to initiate pilot project' });
    }
});

export default router;
