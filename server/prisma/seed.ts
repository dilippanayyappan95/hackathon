import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database with phase 2 exact data...');
    const pwd = await bcrypt.hash('demo123', 10);

    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.scaleDecision.deleteMany();
    await prisma.proofPassport.deleteMany();
    await prisma.validationRecord.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.pilotMilestone.deleteMany();
    await prisma.pilotKPI.deleteMany();
    await prisma.pilotProject.deleteMany();
    await prisma.evaluationScore.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.applicationDocument.deleteMany();
    await prisma.application.deleteMany();
    await prisma.challengeKPI.deleteMany();
    await prisma.challengeRequirement.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.startupDocument.deleteMany();
    await prisma.user.deleteMany();
    await prisma.startup.deleteMany();
    await prisma.department.deleteMany();
    await prisma.role.deleteMany();

    // 1. ROLES
    const roleNames = ['Admin', 'Government Officer', 'Procurement Officer', 'Startup', 'Expert', 'Validator', 'Viewer'];
    const roles: Record<string, string> = {};
    for (const name of roleNames) {
        const r = await prisma.role.create({ data: { name } });
        roles[name] = r.id;
    }

    // 2. DEPARTMENTS
    const deptNames = [
        'Maharashtra Urban Innovation Department',
        'Maharashtra Health Innovation Department',
        'Maharashtra Education Innovation Department',
        'Maharashtra Water & Infrastructure Department'
    ];
    const depts: Record<string, string> = {};
    for (const name of deptNames) {
        const d = await prisma.department.create({ data: { name } });
        depts[name] = d.id;
    }

    // 3. STARTUPS
    const startupsData = [
        { name: 'WasteZero Technologies', domain: 'Waste Management' },
        { name: 'WaterSense Labs', domain: 'Water Management' },
        { name: 'MedFlow AI', domain: 'Healthcare' },
        { name: 'CivicPulse Technologies', domain: 'GovTech' },
        { name: 'EcoGrid Innovations', domain: 'Smart Infrastructure' },
        { name: 'AgriVision Systems', domain: 'Agriculture' },
        { name: 'SafeRoute Mobility', domain: 'Transportation' },
        { name: 'EduBridge Labs', domain: 'Education' },
        { name: 'EnergyLens AI', domain: 'Energy' },
        { name: 'InfraWatch Systems', domain: 'Infrastructure' }
    ];
    const startups: Record<string, string> = {};
    for (const s of startupsData) {
        const row = await prisma.startup.create({
            data: { name: s.name, domain: s.domain, description: `${s.name} specialized in ${s.domain}` }
        });
        startups[s.name] = row.id;
    }

    // 4. USERS
    const officer = await prisma.user.create({ data: { email: 'gov@demo.com', password: pwd, name: 'C. Sharma (Dept)', roleId: roles['Government Officer'], departmentId: depts['Maharashtra Urban Innovation Department'] } });
    const expert = await prisma.user.create({ data: { email: 'expert@demo.com', password: pwd, name: 'Dr. Expert Validate', roleId: roles['Expert'] } });
    const validator = await prisma.user.create({ data: { email: 'validator@demo.com', password: pwd, name: 'Sovereign Auditor', roleId: roles['Validator'] } });
    const startupUser = await prisma.user.create({ data: { email: 'founder@wastezero.com', password: pwd, name: 'Founder WZ', roleId: roles['Startup'], startupId: startups['WasteZero Technologies'] } });

    // 5. CHALLENGES
    const cData = [
        { key: 'C1', title: 'Smart Waste Collection Optimization', dept: 'Maharashtra Urban Innovation Department', stat: 'PUBLISHED', base: '72%', tgt: '90%' },
        { key: 'C2', title: 'Hospital Waiting Time Reduction', dept: 'Maharashtra Health Innovation Department', stat: 'UNDER_EVALUATION', base: '135 minutes', tgt: '60 minutes' },
        { key: 'C3', title: 'Water Leakage Detection', dept: 'Maharashtra Water & Infrastructure Department', stat: 'PUBLISHED', base: '22%', tgt: '15%' },
        { key: 'C4', title: 'School Attendance Improvement', dept: 'Maharashtra Education Innovation Department', stat: 'PUBLISHED', base: '72%', tgt: '87%' },
        { key: 'C5', title: 'Road Maintenance Prediction', dept: 'Maharashtra Urban Innovation Department', stat: 'COMPLETED', base: '12 days', tgt: '8 days' },
        { key: 'C6', title: 'Citizen Grievance Classification', dept: 'Maharashtra Urban Innovation Department', stat: 'UNDER_EVALUATION', base: '20 minutes', tgt: '5 minutes' }
    ];
    const challenges: Record<string, string> = {};
    for (const c of cData) {
        const row = await prisma.challenge.create({
            data: {
                title: c.title,
                departmentId: depts[c.dept],
                description: `Goal: from ${c.base} to ${c.tgt}`,
                status: c.stat,
                targetValue: c.tgt
            }
        });
        challenges[c.key] = row.id;
    }

    // 6. APPLICATIONS (For C1 Waste Collection)
    const appWasteZero = await prisma.application.create({ data: { challengeId: challenges['C1'], startupId: startups['WasteZero Technologies'], status: 'Selected' } });
    const appEcoGrid = await prisma.application.create({ data: { challengeId: challenges['C1'], startupId: startups['EcoGrid Innovations'], status: 'Shortlisted' } });
    const appCivicPulse = await prisma.application.create({ data: { challengeId: challenges['C1'], startupId: startups['CivicPulse Technologies'], status: 'Applied' } });
    const appEnergyLens = await prisma.application.create({ data: { challengeId: challenges['C1'], startupId: startups['EnergyLens AI'], status: 'Applied' } });
    const appInfraWatch = await prisma.application.create({ data: { challengeId: challenges['C1'], startupId: startups['InfraWatch Systems'], status: 'Rejected' } });

    const appMedFlow = await prisma.application.create({ data: { challengeId: challenges['C2'], startupId: startups['MedFlow AI'], status: 'Selected' } });
    const appInfraRoad = await prisma.application.create({ data: { challengeId: challenges['C5'], startupId: startups['InfraWatch Systems'], status: 'Selected' } });

    // 7. EVALUATIONS
    await prisma.evaluation.create({ data: { applicationId: appWasteZero.id, expertId: expert.id, status: 'Submitted', overallScore: 91, declaredNoConflict: true } });
    await prisma.evaluation.create({ data: { applicationId: appEcoGrid.id, expertId: expert.id, status: 'Submitted', overallScore: 84, declaredNoConflict: true } });

    // 8. PILOTS
    const pilotWaste = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C1'], applicationId: appWasteZero.id, startupId: startups['WasteZero Technologies'], status: 'Completed',
            baseline: '72% & ₹12L', target: '90% & ₹9.6L', actual: '92% & 27% reduction', startDate: new Date(Date.now() - 90 * 24 * 3600 * 1000)
        }
    });

    const pilotHospital = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C2'], applicationId: appMedFlow.id, startupId: startups['MedFlow AI'], status: 'Active',
            baseline: '135 minutes', target: '60 minutes', actual: '78 minutes', startDate: new Date(Date.now() - 40 * 24 * 3600 * 1000)
        }
    });

    const pilotRoad = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C5'], applicationId: appInfraRoad.id, startupId: startups['InfraWatch Systems'], status: 'Failed',
            baseline: '12 days', target: '30% improvement', actual: '11%', startDate: new Date(Date.now() - 90 * 24 * 3600 * 1000)
        }
    });

    // 9. KPIs
    // Waste
    await prisma.pilotKPI.create({ data: { pilotId: pilotWaste.id, name: 'Collection Efficiency', baseline: '72%', target: '90%', actual: '92%' } });
    await prisma.pilotKPI.create({ data: { pilotId: pilotWaste.id, name: 'Operating Cost', baseline: '₹12L', target: '₹9.6L', actual: '₹8.76L' } });
    // Hospital
    await prisma.pilotKPI.create({ data: { pilotId: pilotHospital.id, name: 'Waiting Time', baseline: '135 min', target: '60 min', actual: '78 min' } });
    await prisma.pilotKPI.create({ data: { pilotId: pilotHospital.id, name: 'Patient Throughput', baseline: '100/day', target: '130/day', actual: '118/day' } });
    // Road
    await prisma.pilotKPI.create({ data: { pilotId: pilotRoad.id, name: 'Response Time', baseline: '12 days', target: '8 days', actual: '10.7 days' } });

    // 10. Milestones & Evidence (Waste)
    const m1 = await prisma.pilotMilestone.create({ data: { pilotId: pilotWaste.id, title: 'Deployment', status: 'Paid', amount: 20 } });
    await prisma.evidence.create({ data: { pilotId: pilotWaste.id, uploadedById: startupUser.id, fileUrl: 'Pilot_Performance_Report.pdf', fileType: 'PDF', verifiedStatus: 'Verified', milestoneId: m1.id } });

    // 11. Validations
    await prisma.validationRecord.create({ data: { pilotId: pilotWaste.id, validatorId: validator.id, decision: 'Verified', comments: 'Cost Reduction VERIFIED. Collection Efficiency VERIFIED.' } });
    await prisma.validationRecord.create({ data: { pilotId: pilotHospital.id, validatorId: validator.id, decision: 'Partially Verified', comments: 'Waiting Time: PARTIALLY VERIFIED.' } });
    await prisma.validationRecord.create({ data: { pilotId: pilotRoad.id, validatorId: validator.id, decision: 'Rejected', comments: 'Prediction Accuracy: NOT VERIFIED.' } });

    // 12. Passport
    await prisma.proofPassport.create({ data: { pilotId: pilotWaste.id, dataSnapshot: JSON.stringify({ KPI: '91%', Score: '91/100', Recommendation: 'SCALE' }) } });

    // 13. Scale Decisions
    await prisma.scaleDecision.create({ data: { pilotId: pilotWaste.id, decisionById: officer.id, recommendation: 'SCALE', finalDecision: 'SCALE' } });
    await prisma.scaleDecision.create({ data: { pilotId: pilotHospital.id, decisionById: officer.id, recommendation: 'EXTEND PILOT', finalDecision: 'EXTEND PILOT' } });
    await prisma.scaleDecision.create({ data: { pilotId: pilotRoad.id, decisionById: officer.id, recommendation: 'DO NOT SCALE', finalDecision: 'DO NOT SCALE' } });

    console.log("Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
