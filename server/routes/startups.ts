import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Deterministic mock AI matching engine rule set
const generateMatchData = (startupName: string) => {
    switch (startupName) {
        case 'WasteZero Technologies':
        case 'EcoGrid Innovations':
            return {
                score: 94,
                reason: 'Proprietary dynamic routing algos exactly match the required 20% efficiency target requested by municipal departments.'
            };
        case 'MedFlow AI':
            return {
                score: 91,
                reason: 'Patient flow predictive tracking aligns with health SLA expectations, demonstrating 40% wait time reduction.'
            };
        case 'WaterSense Labs':
            return {
                score: 88,
                reason: 'Acoustic leakage sensors fulfill 90% of water infrastructure monitoring parameters out-of-the-box.'
            };
        case 'SafeRoute Mobility':
        case 'InfraWatch Systems':
            return {
                score: 85,
                reason: 'Traffic analytics algorithms match road maintenance and urban transit safety objectives with proven pilot success.'
            };
        default:
            return {
                score: 75,
                reason: 'Solution presents foundational capabilities that require moderate customization to meet departmental sovereign requirements.'
            };
    }
};

// Get all startups for discovery with AI matching
router.get('/', authenticateToken, async (req, res) => {
    const { domain, search } = req.query;
    try {
        const where: any = {};
        if (domain) where.domain = typeof domain === 'string' && domain.toLowerCase() !== 'all' ? domain : undefined;
        if (search) where.name = { contains: search as string, mode: 'insensitive' };

        const startups = await prisma.startup.findMany({
            where,
            include: { applications: true }
        });

        // Add deterministic matching based on startup name
        const startupsWithScores = startups.map(s => {
            const matchData = generateMatchData(s.name);
            return {
                ...s,
                matchScore: matchData.score,
                matchReason: matchData.reason
            };
        });

        res.json(startupsWithScores);
    } catch {
        res.status(500).json({ error: 'Failed to fetch startups' });
    }
});

// Generic GET for single startup context
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const startup = await prisma.startup.findUnique({
            where: { id: req.params.id },
            include: { applications: true, pilots: true }
        });
        res.json(startup);
    } catch {
        res.status(500).json({ error: 'Failed to fetch startup' });
    }
});

export default router;
