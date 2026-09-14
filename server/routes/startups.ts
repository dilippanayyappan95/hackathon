import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { AIService } from '../services/aiService';

const router = Router();

// Get all startups with dynamic explainable AI matching
router.get('/', authenticateToken, async (req, res) => {
    const { domain, search, challengeId, minScore } = req.query;
    try {
        const where: any = {};
        if (domain && domain !== 'ALL' && domain !== 'All') {
            where.domain = { contains: domain as string, mode: 'insensitive' };
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { domain: { contains: search as string, mode: 'insensitive' } },
                { technology: { contains: search as string, mode: 'insensitive' } },
                { capabilities: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const startups = await prisma.startup.findMany({
            where,
            include: {
                applications: { include: { challenge: true } },
                pilots: { include: { challenge: true, validations: true, passports: true } }
            }
        });

        // If challengeId is provided, perform dynamic AI matching against that specific challenge
        let challenge: any = null;
        if (challengeId) {
            challenge = await prisma.challenge.findUnique({
                where: { id: challengeId as string },
                include: { requirements: true, kpis: true }
            });
        } else {
            // Default match against the first active/published challenge for context
            challenge = await prisma.challenge.findFirst({
                where: { status: { in: ['PUBLISHED', 'UNDER_EVALUATION', 'COMPLETED'] } }
            });
        }

        const startupsWithScores = startups.map(s => {
            const matchAnalysis = challenge
                ? AIService.matchStartupToChallenge(challenge, s)
                : {
                    matchScore: 85,
                    capabilityScore: 88,
                    domainScore: 85,
                    techScore: 85,
                    experienceScore: 80,
                    matchingReasons: ['Verified DPIIT enterprise credentials and municipal compatibility'],
                    potentialGaps: [],
                    whyThisStartup: 'Solution capabilities align with public innovation procurement objectives.'
                };

            const completedPilots = s.pilots.filter(p => p.status === 'COMPLETED');
            const verifiedPilots = s.pilots.filter(p => p.validations.some(v => v.decision === 'VALIDATED'));

            return {
                ...s,
                matchScore: matchAnalysis.matchScore,
                capabilityScore: matchAnalysis.capabilityScore,
                domainScore: matchAnalysis.domainScore,
                techScore: matchAnalysis.techScore,
                experienceScore: matchAnalysis.experienceScore,
                matchingReasons: matchAnalysis.matchingReasons,
                potentialGaps: matchAnalysis.potentialGaps,
                matchReason: matchAnalysis.whyThisStartup,
                whyThisStartup: matchAnalysis.whyThisStartup,
                totalPilots: s.pilots.length,
                completedPilotsCount: completedPilots.length,
                verifiedPilotsCount: verifiedPilots.length
            };
        });

        let filtered = startupsWithScores;
        if (minScore) {
            const min = parseInt(minScore as string, 10);
            filtered = filtered.filter(s => s.matchScore >= min);
        }

        // Sort by matchScore descending by default
        filtered.sort((a, b) => b.matchScore - a.matchScore);

        res.json(filtered);
    } catch (e) {
        console.error('[Get Startups Error]:', e);
        res.status(500).json({ error: 'Failed to fetch startups' });
    }
});

// Single startup profile detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const startup = await prisma.startup.findUnique({
            where: { id: req.params.id },
            include: {
                applications: { include: { challenge: true } },
                pilots: {
                    include: {
                        challenge: { include: { department: true } },
                        kpis: true,
                        validations: true,
                        passports: true,
                        scaleDecision: true
                    }
                },
                documents: true
            }
        });

        if (!startup) {
            return res.status(404).json({ error: 'Startup not found' });
        }

        res.json(startup);
    } catch (e) {
        console.error('[Get Startup Profile Error]:', e);
        res.status(500).json({ error: 'Failed to fetch startup profile' });
    }
});

export default router;
