import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get all pilots with relations and filters
router.get('/', authenticateToken, async (req, res) => {
    const { status, search, departmentId } = req.query;
    try {
        const where: any = {};
        if (status && status !== 'ALL') {
            if (status.toString().toUpperCase() === 'ACTIVE') {
                where.status = { in: ['ACTIVE', 'Active', 'PLANNED', 'Planned'] };
            } else if (status.toString().toUpperCase() === 'COMPLETED') {
                where.status = { in: ['COMPLETED', 'Completed'] };
            } else {
                where.status = status;
            }
        }

        if (departmentId && departmentId !== 'ALL') {
            where.challenge = { departmentId: departmentId as string };
        }

        const pilots = await prisma.pilotProject.findMany({
            where,
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: { include: { evidence: true } },
                milestones: { include: { payments: true, evidence: true } },
                evidence: { include: { uploadedBy: true } },
                validations: { include: { validator: true } },
                passports: true,
                scaleDecision: true
            },
            orderBy: { createdAt: 'desc' }
        });

        let filtered = pilots;
        if (search) {
            const term = (search as string).toLowerCase();
            filtered = pilots.filter(p =>
                p.startup.name.toLowerCase().includes(term) ||
                p.challenge.title.toLowerCase().includes(term) ||
                (p.pilotLocation && p.pilotLocation.toLowerCase().includes(term))
            );
        }

        res.json(filtered);
    } catch (e) {
        console.error('[Get Pilots Error]:', e);
        res.status(500).json({ error: 'Failed to fetch pilots' });
    }
});

// Arena benchmarking endpoint
router.get('/arena/benchmark', authenticateToken, async (req, res) => {
    const { pilotId1, pilotId2 } = req.query;
    try {
        const pilots = await prisma.pilotProject.findMany({
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                milestones: true,
                validations: true,
                passports: true,
                scaleDecision: true
            },
            orderBy: { createdAt: 'desc' }
        });

        let p1 = pilots.find(p => p.id === pilotId1) || pilots[0];
        let p2 = pilots.find(p => p.id === pilotId2) || pilots[1] || pilots[0];

        res.json({ pilot1: p1, pilot2: p2, allPilots: pilots });
    } catch (e) {
        console.error('[Pilot Arena Benchmark Error]:', e);
        res.status(500).json({ error: 'Failed to fetch arena benchmark data' });
    }
});

// Single pilot detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const pilot = await prisma.pilotProject.findUnique({
            where: { id: req.params.id },
            include: {
                startup: true,
                challenge: { include: { department: true, requirements: true, kpis: true } },
                kpis: { include: { evidence: true } },
                milestones: { include: { payments: true, evidence: true } },
                payments: true,
                evidence: { include: { uploadedBy: true } },
                validations: { include: { validator: true } },
                passports: true,
                scaleDecision: true
            }
        });

        if (!pilot) {
            return res.status(404).json({ error: 'Pilot project not found' });
        }

        res.json(pilot);
    } catch (e) {
        console.error('[Get Pilot Detail Error]:', e);
        res.status(500).json({ error: 'Failed to fetch pilot details' });
    }
});

// Update pilot general details or status
router.patch('/:id', authenticateToken, requireRole(['Government Officer', 'Admin', 'Startup']), async (req: AuthRequest, res) => {
    const { status, actual, baseline, target, pilotLocation, risks, objectives } = req.body;
    try {
        const pilot = await prisma.pilotProject.update({
            where: { id: req.params.id },
            data: {
                status,
                actual,
                baseline,
                target,
                pilotLocation,
                risks,
                objectives
            },
            include: { startup: true, challenge: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PILOT_UPDATED',
                entity: 'PilotProject',
                entityId: pilot.id,
                userId: req.user?.userId,
                details: JSON.stringify(req.body)
            }
        });

        res.json(pilot);
    } catch (e) {
        console.error('[Update Pilot Error]:', e);
        res.status(500).json({ error: 'Failed to update pilot' });
    }
});

// Provision new Pilot Project
router.post('/', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const {
        challengeId,
        startupId,
        applicationId: inputAppId,
        title,
        location,
        pilotLocation,
        startDate,
        endDate,
        status = 'ACTIVE',
        baseline,
        target,
        actual,
        risks,
        objectives,
        kpis = [],
        milestones = []
    } = req.body;

    if (!challengeId || !startupId) {
        return res.status(400).json({ error: 'Challenge ID and Startup ID are required' });
    }

    try {
        // Resolve application
        let appId = inputAppId;
        if (!appId) {
            const existingApp = await prisma.application.findFirst({
                where: { challengeId, startupId }
            });
            if (existingApp) {
                appId = existingApp.id;
            } else {
                const newApp = await prisma.application.create({
                    data: {
                        challengeId,
                        startupId,
                        status: 'SELECTED',
                        solutionSummary: title || 'Automated pilot application'
                    }
                });
                appId = newApp.id;
            }
        }

        const pilot = await prisma.pilotProject.create({
            data: {
                challengeId,
                startupId,
                applicationId: appId,
                status: status || 'ACTIVE',
                pilotLocation: pilotLocation || location || 'Municipal Sandbox Location',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(Date.now() + 90 * 86400000),
                baseline: baseline || (kpis[0]?.baselineValue || kpis[0]?.baseline) || '90 Minutes',
                target: target || (kpis[0]?.targetValue || kpis[0]?.target) || '45 Minutes',
                actual: actual || (kpis[0]?.actualValue || kpis[0]?.actual) || '48 Minutes',
                risks: risks || 'Operational integration edge variance monitored',
                objectives: objectives || title || 'Pilot validation project',
                ownerId: req.user!.userId,
                kpis: {
                    create: kpis.map((k: any) => ({
                        name: k.name || 'Core Performance KPI',
                        description: k.metric || k.description || k.name,
                        unit: k.unit || 'Minutes',
                        baseline: String(k.baselineValue || k.baseline || '90'),
                        target: String(k.targetValue || k.target || '45'),
                        actual: String(k.actualValue || k.actual || '48'),
                        status: k.status || 'ACHIEVED',
                        source: k.source || 'IoT Telemetry Stream'
                    }))
                },
                milestones: {
                    create: milestones.map((m: any) => ({
                        title: m.title || m.name || 'Key Pilot Milestone',
                        description: m.description || 'Milestone deliverable',
                        dueDate: m.dueDate ? new Date(m.dueDate) : new Date(),
                        completionDate: m.status === 'COMPLETED' ? new Date() : undefined,
                        amount: Number(m.paymentAmount || m.amount || 500000),
                        status: m.status || 'COMPLETED',
                        deliverable: m.deliverable || 'Telemetry and verification report'
                    }))
                }
            },
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                milestones: true,
                evidence: true,
                validations: true,
                passports: true,
                scaleDecision: true
            }
        });

        // Update challenge status to PILOT if not already
        await prisma.challenge.update({
            where: { id: challengeId },
            data: { status: 'PILOT' }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PILOT_PROVISIONED',
                entity: 'PilotProject',
                entityId: pilot.id,
                userId: req.user!.userId,
                details: JSON.stringify({
                    title: pilot.challenge.title,
                    startup: pilot.startup.name,
                    pilotId: pilot.id
                })
            }
        });

        res.status(201).json(pilot);
    } catch (e) {
        console.error('[Create Pilot Error]:', e);
        res.status(500).json({ error: 'Failed to create pilot project' });
    }
});

// Update actual KPI telemetry
router.patch('/:id/kpi/:kpiId', authenticateToken, requireRole(['Startup', 'Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { actual, status, source } = req.body;
    try {
        const kpi = await prisma.pilotKPI.update({
            where: { id: req.params.kpiId },
            data: { actual, status, source }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PILOT_KPI_UPDATED',
                entity: 'PilotKPI',
                entityId: kpi.id,
                userId: req.user?.userId,
                details: JSON.stringify({ name: kpi.name, actual, status })
            }
        });

        res.json(kpi);
    } catch (e) {
        console.error('[Update KPI Error]:', e);
        res.status(500).json({ error: 'Failed to update KPI metric' });
    }
});

// Update Milestone status
router.patch('/milestone/:id', authenticateToken, requireRole(['Startup', 'Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { status, completionDate, deliverable } = req.body;
    try {
        const milestone = await prisma.pilotMilestone.update({
            where: { id: req.params.id },
            data: {
                status,
                completionDate: completionDate ? new Date(completionDate) : status === 'COMPLETED' ? new Date() : undefined,
                deliverable
            }
        });

        await prisma.auditLog.create({
            data: {
                action: `MILESTONE_${status}`,
                entity: 'PilotMilestone',
                entityId: milestone.id,
                userId: req.user?.userId,
                details: JSON.stringify({ title: milestone.title, status })
            }
        });

        res.json(milestone);
    } catch (e) {
        console.error('[Update Milestone Error]:', e);
        res.status(500).json({ error: 'Failed to update milestone' });
    }
});

export default router;
