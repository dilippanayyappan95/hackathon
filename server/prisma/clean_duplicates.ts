import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let url = process.env.DATABASE_URL || '';
if (!url.includes('pgbouncer=true')) {
    url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
}

const prisma = new PrismaClient({
    datasources: { db: { url } }
});

const CANONICAL_CHALLENGE_TITLES = [
    'Hospital Waiting Time Reduction & Outpatient Orchestration',
    'Smart Waste Collection & Dynamic Route Optimization',
    'Subterranean Water Leakage & Burst Detection Telemetry',
    'Automated Model School Attendance & Retention Monitoring',
    'Automated Road Defect & Pothole Telemetry',
    'Citizen Grievance Automated NLP Classification & SLA Triage'
];

export async function cleanDuplicateChallenges() {
    console.log('[Clean Duplicates] Auditing challenges in database...');

    const allChallenges = await prisma.challenge.findMany({
        include: {
            department: true,
            requirements: true,
            kpis: true,
            applications: {
                include: {
                    evaluations: { include: { scores: true } },
                    documents: true,
                    pilots: true
                }
            },
            pilots: {
                include: {
                    kpis: true,
                    milestones: { include: { payments: true, evidence: true } },
                    payments: true,
                    evidence: true,
                    validations: true,
                    passports: true,
                    scaleDecision: { include: { procurement: true } }
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    const canonicalKept: string[] = [];
    const redundantIds: string[] = [];

    for (const ch of allChallenges) {
        const isCanonicalTitle = CANONICAL_CHALLENGE_TITLES.includes(ch.title);
        const isCorrectDept = (
            (ch.title === 'Hospital Waiting Time Reduction & Outpatient Orchestration' && ch.department?.name.includes('Health')) ||
            (ch.title === 'Smart Waste Collection & Dynamic Route Optimization' && ch.department?.name.includes('Urban')) ||
            (ch.title === 'Subterranean Water Leakage & Burst Detection Telemetry' && ch.department?.name.includes('Water')) ||
            (ch.title === 'Automated Model School Attendance & Retention Monitoring' && ch.department?.name.includes('Education')) ||
            (ch.title === 'Automated Road Defect & Pothole Telemetry' && ch.department?.name.includes('Urban')) ||
            (ch.title === 'Citizen Grievance Automated NLP Classification & SLA Triage' && ch.department?.name.includes('Urban'))
        );

        if (isCanonicalTitle && isCorrectDept && !canonicalKept.includes(ch.title)) {
            canonicalKept.push(ch.title);
            console.log(`  [PRESERVED] ${ch.title} (ID: ${ch.id})`);
        } else {
            redundantIds.push(ch.id);
            console.log(`  [MARKED FOR CLEANUP] ${ch.title} (ID: ${ch.id})`);
        }
    }

    if (redundantIds.length === 0) {
        console.log('[Clean Duplicates] No duplicate/redundant challenges found.');
        return;
    }

    console.log(`\n[Clean Duplicates] Deleting ${redundantIds.length} redundant challenges in relational cascade order...`);

    // 1. Find all pilots linked to redundant challenges
    const pilots = await prisma.pilotProject.findMany({
        where: { challengeId: { in: redundantIds } },
        include: { scaleDecision: true }
    });
    const pilotIds = pilots.map(p => p.id);
    const scaleDecisionIds = pilots.map(p => p.scaleDecision?.id).filter(Boolean) as string[];

    // 2. Find all applications linked to redundant challenges
    const apps = await prisma.application.findMany({
        where: { challengeId: { in: redundantIds } },
        include: { evaluations: true }
    });
    const appIds = apps.map(a => a.id);
    const evalIds = apps.flatMap(a => a.evaluations.map(e => e.id));

    // Delete in cascade order:
    if (scaleDecisionIds.length > 0) {
        await prisma.procurementRecord.deleteMany({ where: { scaleDecisionId: { in: scaleDecisionIds } } });
        await prisma.scaleDecision.deleteMany({ where: { id: { in: scaleDecisionIds } } });
    }

    if (pilotIds.length > 0) {
        await prisma.proofPassport.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.validationRecord.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.evidence.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.payment.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.pilotMilestone.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.pilotKPI.deleteMany({ where: { pilotId: { in: pilotIds } } });
        await prisma.pilotProject.deleteMany({ where: { id: { in: pilotIds } } });
    }

    if (evalIds.length > 0) {
        await prisma.evaluationScore.deleteMany({ where: { evaluationId: { in: evalIds } } });
        await prisma.evaluation.deleteMany({ where: { id: { in: evalIds } } });
    }

    if (appIds.length > 0) {
        await prisma.applicationDocument.deleteMany({ where: { applicationId: { in: appIds } } });
        await prisma.application.deleteMany({ where: { id: { in: appIds } } });
    }

    await prisma.challengeKPI.deleteMany({ where: { challengeId: { in: redundantIds } } });
    await prisma.challengeRequirement.deleteMany({ where: { challengeId: { in: redundantIds } } });
    await prisma.challenge.deleteMany({ where: { id: { in: redundantIds } } });

    console.log('[Clean Duplicates] Successfully cleaned up redundant records.');
}

if (require.main === module) {
    cleanDuplicateChallenges()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}
