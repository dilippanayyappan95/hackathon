import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get procurement readiness records & tender blueprints
router.get('/', authenticateToken, async (_req, res) => {
    try {
        const records = await prisma.procurementRecord.findMany({
            include: {
                scaleDecision: {
                    include: {
                        pilot: {
                            include: {
                                startup: true,
                                challenge: { include: { department: true } },
                                kpis: true,
                                passports: true,
                                validations: true
                            }
                        },
                        decisionBy: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(records);
    } catch (e) {
        console.error('[Get Procurement Records Error]:', e);
        res.status(500).json({ error: 'Failed to fetch procurement records' });
    }
});

// Single procurement blueprint for a pilot
router.get('/pilot/:pilotId', authenticateToken, async (req, res) => {
    try {
        const pilot = await prisma.pilotProject.findUnique({
            where: { id: req.params.pilotId },
            include: {
                startup: true,
                challenge: { include: { department: true } },
                kpis: true,
                evidence: true,
                validations: true,
                passports: true,
                scaleDecision: {
                    include: {
                        procurement: true,
                        decisionBy: true
                    }
                }
            }
        });

        if (!pilot) {
            return res.status(404).json({ error: 'Pilot project not found' });
        }

        const isPassportReady = pilot.passports.length > 0;
        const isValidated = pilot.validations.some(v => v.decision === 'VALIDATED');
        const isScaleApproved = pilot.scaleDecision?.finalDecision === 'SCALE' || pilot.scaleDecision?.finalDecision === 'PROCEED TO PROCUREMENT';

        let tenderDraft = {
            scopeOfWork: `State-wide implementation of verified solution: "${pilot.challenge.title}". The deployment shall replicate the telemetry architecture validated during the pilot at ${pilot.pilotLocation || 'Municipal Sandbox'}, meeting or exceeding the verified operational target of ${pilot.target || 'target metrics'}.`,
            contractLifecycle: '3 Years (Extendable to 5 Years)',
            tenderCategory: 'High-Impact Innovation Services / Smart Telemetry',
            estimatedValue: '₹4,80,00,000',
            fastTrackExemption: 'Eligible under State Innovation Procurement Policy 2026 (Exempt from prior turnover clause due to verified Proof Passport).',
            requiredCertifications: ['DPIIT Startup Recognition', 'ISO 27001 Information Security', 'Verified GovProof Passport ID']
        };

        const currentStatus = isScaleApproved && isValidated ? 'PROCUREMENT READY' : isPassportReady ? 'READY FOR REVIEW' : 'NOT READY';

        res.json({
            pilot,
            status: currentStatus,
            procurementStatus: currentStatus,
            fastTrackEligible: isPassportReady && isValidated,
            tenderDocUrl: pilot.scaleDecision?.procurement?.tenderDocUrl || `Tender_Draft_${pilot.startup?.name?.replace(/\s+/g, '_') || 'FastTrack'}_2026.pdf`,
            tenderDraft,
            checklist: {
                proofPassportStatus: isPassportReady ? 'VERIFIED' : 'PENDING',
                validationStatus: isValidated ? 'VALIDATED' : 'IN_REVIEW',
                scaleDecisionStatus: isScaleApproved ? 'APPROVED' : 'PENDING',
                documentationCompleteness: 'COMPLETE',
                securityReadiness: 'CERTIFIED',
                riskStatus: 'LOW'
            }
        });
    } catch (e) {
        console.error('[Get Pilot Procurement Blueprint Error]:', e);
        res.status(500).json({ error: 'Failed to fetch procurement blueprint' });
    }
});

// Update tender documentation
router.post('/tender', authenticateToken, requireRole(['Procurement Officer', 'Government Officer', 'Admin']), async (req: AuthRequest, res) => {
    const { scaleDecisionId, specifications, tenderDocUrl, status } = req.body;
    try {
        const record = await prisma.procurementRecord.upsert({
            where: { scaleDecisionId },
            update: {
                specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications),
                tenderDocUrl: tenderDocUrl || 'Tender_Draft_2026.pdf',
                status: status || 'PROCUREMENT READY'
            },
            create: {
                scaleDecisionId,
                specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications),
                tenderDocUrl: tenderDocUrl || 'Tender_Draft_2026.pdf',
                status: status || 'PROCUREMENT READY'
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PROCUREMENT_TENDER_DRAFTED',
                entity: 'ProcurementRecord',
                entityId: record.id,
                userId: req.user?.userId,
                details: JSON.stringify({ scaleDecisionId, status: record.status })
            }
        });

        res.json(record);
    } catch (e) {
        console.error('[Save Procurement Tender Error]:', e);
        res.status(500).json({ error: 'Failed to update procurement tender' });
    }
});

export default router;
