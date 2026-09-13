import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const challengesCount = await prisma.challenge.count();
        const applicationsCount = await prisma.application.count();
        const shortlisedCount = await prisma.application.count({ where: { status: 'Selected' } });

        const pilotsCount = await prisma.pilotProject.count();
        const activePilotsCount = await prisma.pilotProject.count({ where: { status: 'Active' } });
        const completedPilotsCount = await prisma.pilotProject.count({ where: { status: 'Completed' } });

        const validatedCount = await prisma.validationRecord.count({ where: { decision: 'Verify' } });
        const scaleReadyCount = await prisma.scaleDecision.count({ where: { recommendation: 'SCALE' } });
        const startupsCount = await prisma.startup.count();

        res.json({
            challenges: challengesCount,
            applications: applicationsCount,
            shortlisted: shortlisedCount,
            pilots: pilotsCount,
            activePilots: activePilotsCount,
            completedPilots: completedPilotsCount,
            validated: validatedCount,
            scaled: scaleReadyCount,
            startups: startupsCount
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error retrieving analytics' });
    }
});

export default router;
