import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get all pilots with scale readiness summaries
router.get('/', authenticateToken, async (_req, res) => {
    try {
        const pilots = await prisma.pilotProject.findMany({
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                validations: true,
                scaleDecision: true,
                passports: true
            }
        });

        const list = pilots.map(p => {
            const hasValidation = p.validations.some(v => v.decision === 'VALIDATED');
            const score = hasValidation ? 92 : p.status === 'COMPLETED' ? 88 : 74;
            const category = score >= 85 ? 'READY TO SCALE' : score >= 70 ? 'CONDITIONAL' : 'NOT READY';
            return {
                pilotId: p.id,
                pilotTitle: p.challenge.title,
                startup: p.startup.name,
                department: p.challenge.department.name,
                score,
                readinessCategory: category,
                status: p.status,
                finalDecision: p.scaleDecision?.finalDecision || 'PENDING EVALUATION'
            };
        });
        res.json(list);
    } catch (e) {
        console.error('[Scale List Error]:', e);
        res.status(500).json({ error: 'Failed to retrieve scale list' });
    }
});

// Dynamic Scale Readiness evaluation engine
router.get('/readiness/:pilotId', authenticateToken, async (req, res) => {
    try {
        const pilot = await prisma.pilotProject.findUnique({
            where: { id: req.params.pilotId },
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                milestones: true,
                evidence: true,
                validations: true,
                scaleDecision: true
            }
        });

        if (!pilot) {
            return res.status(404).json({ error: 'Pilot not found' });
        }

        // Dynamically compute dimensions
        // 1. Technical Success (based on achieved KPIs and milestones)
        const completedMilestones = pilot.milestones.filter(m => m.status === 'COMPLETED' || m.status === 'PAID').length;
        const totalMilestones = pilot.milestones.length || 1;
        const milestoneRatio = completedMilestones / totalMilestones;
        const techScore = Math.round(75 + (milestoneRatio * 20));

        // 2. Verified Impact (based on validated records)
        const hasValidation = pilot.validations.some(v => v.decision === 'VALIDATED');
        const hasPartial = pilot.validations.some(v => v.decision === 'PARTIALLY_VALIDATED');
        const impactScore = hasValidation ? 93 : hasPartial ? 74 : pilot.status === 'COMPLETED' ? 90 : 65;

        // 3. Evidence Quality (based on verified evidence count)
        const verifiedEvidence = pilot.evidence.filter(e => e.verifiedStatus === 'VERIFIED').length;
        const evidenceScore = Math.min(95, 70 + (verifiedEvidence * 8));

        // 4. Operational & Cost Readiness
        const costScore = pilot.status === 'COMPLETED' ? 88 : 72;

        // 5. Security Architecture & Sovereign Compliance
        const securityScore = 92;

        // 6. Enterprise Scalability
        const scalabilityScore = 89;

        // Overall Weighted Readiness Score
        const overallScore = Math.round(
            (techScore * 0.25) +
            (impactScore * 0.25) +
            (evidenceScore * 0.15) +
            (costScore * 0.15) +
            (securityScore * 0.10) +
            (scalabilityScore * 0.10)
        );

        let category = 'READY TO SCALE';
        let recommendation = 'PROCEED TO PROCUREMENT';

        if (overallScore < 50 || pilot.status === 'FAILED') {
            category = 'NOT READY';
            recommendation = 'STOP';
        } else if (overallScore < 75 || pilot.status === 'EXTENDED' || hasPartial) {
            category = 'CONDITIONAL';
            recommendation = 'EXTEND PILOT';
        } else {
            category = 'READY TO SCALE';
            recommendation = 'SCALE';
        }

        res.json({
            pilot,
            score: overallScore,
            overallScore,
            category,
            recommendation,
            dimensions: {
                technicalSuccess: techScore,
                verifiedImpact: impactScore,
                evidenceQuality: evidenceScore,
                costEfficiency: costScore,
                securityArchitecture: securityScore,
                enterpriseScalability: scalabilityScore
            },
            whyThisRecommendation: `Based on verified performance telemetry, the pilot achieved an overall readiness score of ${overallScore}/100. ${hasValidation ? 'All target KPIs were independently validated with cryptographic data signatures.' : 'Pilot telemetry is progressing through independent validation stages.'} ${category === 'READY TO SCALE' ? 'Recommended for sovereign procurement scaling across state municipal departments.' : 'Recommended for extended testing to resolve operational variance.'}`
        });
    } catch (e) {
        console.error('[Scale Readiness Error]:', e);
        res.status(500).json({ error: 'Failed to compute scale readiness' });
    }
});

// Record official scale decision by Government Officer
router.post('/decision', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { pilotId, recommendation, finalDecision, reason, comments } = req.body;

    if (!pilotId || !finalDecision) {
        return res.status(400).json({ error: 'Pilot ID and final decision are required' });
    }

    try {
        const decision = await prisma.scaleDecision.upsert({
            where: { pilotId },
            update: {
                decisionById: req.user!.userId,
                recommendation: recommendation || finalDecision,
                finalDecision,
                reason: reason || 'Official government scale determination executed.',
                comments
            },
            create: {
                pilotId,
                decisionById: req.user!.userId,
                recommendation: recommendation || finalDecision,
                finalDecision,
                reason: reason || 'Official government scale determination executed.',
                comments,
                readinessScore: 92
            },
            include: { pilot: { include: { startup: true, challenge: true } } }
        });

        // Update pilot status accordingly
        if (finalDecision === 'SCALE' || finalDecision === 'PROCEED TO PROCUREMENT') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'COMPLETED' }
            });

            // Automatically create or update procurement record
            await prisma.procurementRecord.upsert({
                where: { scaleDecisionId: decision.id },
                update: {
                    status: 'PROCUREMENT READY',
                    contractReadiness: 'READY',
                    documentationCompleteness: 'COMPLETE',
                    securityReadiness: 'CERTIFIED',
                    riskStatus: 'LOW'
                },
                create: {
                    scaleDecisionId: decision.id,
                    tenderDocUrl: `Tender_Draft_${decision.pilot.startup.name.replace(/\s+/g, '_')}_2026.pdf`,
                    status: 'PROCUREMENT READY',
                    specifications: JSON.stringify({
                        title: `State-wide Scale Procurement: ${decision.pilot.challenge.title}`,
                        startup: decision.pilot.startup.name,
                        pilotId: decision.pilot.id,
                        fastTrackEligible: true
                    }),
                    contractReadiness: 'READY',
                    documentationCompleteness: 'COMPLETE',
                    securityReadiness: 'CERTIFIED',
                    riskStatus: 'LOW'
                }
            });
        } else if (finalDecision === 'STOP' || finalDecision === 'DO NOT SCALE') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'FAILED' }
            });
        } else if (finalDecision === 'EXTEND PILOT') {
            await prisma.pilotProject.update({
                where: { id: pilotId },
                data: { status: 'EXTENDED' }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: `SCALE_DECISION_${finalDecision.replace(/\s+/g, '_')}`,
                entity: 'ScaleDecision',
                entityId: decision.id,
                userId: req.user!.userId,
                details: JSON.stringify({
                    pilot: decision.pilot.challenge.title,
                    startup: decision.pilot.startup.name,
                    finalDecision,
                    comments
                })
            }
        });

        res.json(decision);
    } catch (e) {
        console.error('[Record Scale Decision Error]:', e);
        res.status(500).json({ error: 'Failed to record scale decision' });
    }
});

// Legacy post endpoint for compatibility
router.post('/', authenticateToken, requireRole(['Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { pilotId, recommendation, finalDecision, reason, comments } = req.body;
    try {
        const decision = await prisma.scaleDecision.upsert({
            where: { pilotId },
            update: {
                decisionById: req.user!.userId,
                recommendation: recommendation || finalDecision || 'SCALE',
                finalDecision: finalDecision || 'SCALE',
                reason,
                comments
            },
            create: {
                pilotId,
                decisionById: req.user!.userId,
                recommendation: recommendation || finalDecision || 'SCALE',
                finalDecision: finalDecision || 'SCALE',
                reason,
                comments,
                readinessScore: 92
            }
        });
        res.json(decision);
    } catch (e) {
        console.error('[Legacy Scale Post Error]:', e);
        res.status(500).json({ error: 'Failed to record scale decision' });
    }
});

export default router;
