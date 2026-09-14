import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('[GovProof Seed] Initializing deterministic government testbed data...');
    const pwd = await bcrypt.hash('demo123', 10);

    // Clean existing tables in proper relational cascade order
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.procurementRecord.deleteMany();
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
    console.log('1. Creating Roles...');
    const roleNames = ['Admin', 'Government Officer', 'Procurement Officer', 'Startup', 'Expert', 'Validator', 'Viewer'];
    const roles: Record<string, string> = {};
    for (const name of roleNames) {
        const r = await prisma.role.create({ data: { name, description: `Official ${name} role with RBAC permissions` } });
        roles[name] = r.id;
    }

    // 2. DEPARTMENTS
    console.log('2. Creating Departments...');
    const deptData = [
        { name: 'Maharashtra Urban Innovation Department', description: 'Municipal solid waste, transit telemetry, and smart city services' },
        { name: 'Maharashtra Health Innovation Department', description: 'Public health infrastructure, hospital queuing, and clinical diagnostics' },
        { name: 'Maharashtra Education Innovation Department', description: 'Model school retention, digital attendance, and vocational testbeds' },
        { name: 'Maharashtra Water & Infrastructure Department', description: 'Non-revenue water tracking, hydrophone telemetry, and road quality' }
    ];
    const depts: Record<string, string> = {};
    for (const d of deptData) {
        const row = await prisma.department.create({ data: d });
        depts[d.name] = row.id;
    }

    // 3. STARTUPS
    console.log('3. Creating Startups...');
    const startupsData = [
        {
            name: 'MedFlow AI',
            domain: 'Healthcare',
            technology: 'AI Patient Flow & Outpatient Queuing Telemetry',
            capabilities: 'Dynamic Doctor Schedule Allocation, EMR API, Real-Time Triage, Wait Time Prediction',
            experience: 'Deployed across 3 tertiary municipal hospitals with 47% average wait time reduction',
            dpiitNumber: 'DIPP89231',
            foundedYear: 2022,
            stage: 'Series A',
            description: 'MedFlow AI delivers intelligent queue and appointment routing algorithms designed for high-density public healthcare facilities.'
        },
        {
            name: 'WasteZero Technologies',
            domain: 'Waste Management',
            technology: 'Ultrasonic Bin Fill-Level IoT & Dynamic Route Dispatch',
            capabilities: 'Dynamic Vehicle Routing, Telemetry Sensors, Fuel Consumption Analytics, GIS Mapping',
            experience: 'Piloted with Pune Municipal Corporation achieving 27% fuel cost savings and zero overflow',
            dpiitNumber: 'DIPP78231',
            foundedYear: 2022,
            stage: 'Growth',
            description: 'WasteZero provides end-to-end municipal solid waste telemetry and vehicle optimization software.'
        },
        {
            name: 'WaterSense Labs',
            domain: 'Water & Infrastructure',
            technology: 'Acoustic Hydrophone Telemetry & Transient Pressure Flow AI',
            capabilities: 'Subterranean Pipe Fracture Detection, Non-Revenue Water Loss Analytics, SCADA Integration',
            experience: 'Monitored 150km municipal distribution grid reducing water leakage by 35%',
            dpiitNumber: 'DIPP49102',
            foundedYear: 2021,
            stage: 'Series A',
            description: 'WaterSense Labs detects subterranean municipal water leaks using acoustic sensor arrays and machine learning.'
        },
        {
            name: 'CivicPulse Technologies',
            domain: 'GovTech',
            technology: 'Multilingual NLP Grievance Classification & Priority Dispatch',
            capabilities: 'Automated Ticket Triaging, Sentiment Analysis, SLA Breach Escalation, WhatsApp Bot Integration',
            experience: 'Processed over 500,000 citizen grievance petitions across state portals',
            dpiitNumber: 'DIPP65112',
            foundedYear: 2023,
            stage: 'Seed',
            description: 'CivicPulse auto-triages citizen complaints using multilingual natural language models.'
        },
        {
            name: 'EcoGrid Innovations',
            domain: 'Smart Infrastructure',
            technology: 'Microgrid Energy Telemetry & Dynamic EV Fleet Load Balancing',
            capabilities: 'Peak Shaving, Power Factor Optimization, Real-time Energy Monitoring, Solar Telemetry',
            experience: 'Active sandbox testbed in state industrial corridors reducing peak power tariffs by 18%',
            dpiitNumber: 'DIPP32098',
            foundedYear: 2020,
            stage: 'Growth',
            description: 'EcoGrid develops smart grid telemetry and energy efficiency systems for municipal infrastructure.'
        },
        {
            name: 'AgriVision Systems',
            domain: 'Agriculture',
            technology: 'Hyperspectral Drone Imagery & Soil Moisture Sensor Telemetry',
            capabilities: 'Crop Stress Mapping, Yield Forecasting, Drought Early Warning, Direct Farmer Advisory',
            experience: 'Covered 50,000 hectares across rural clusters in pilot partnership with Agriculture Dept',
            dpiitNumber: 'DIPP51287',
            foundedYear: 2023,
            stage: 'Seed',
            description: 'AgriVision provides precision agricultural telemetry from edge drone scans.'
        },
        {
            name: 'SafeRoute Mobility',
            domain: 'Transportation',
            technology: 'Edge Computer Vision & Emergency Green Corridor Orchestration',
            capabilities: 'Traffic Signal Priority, Ambulance Fast-Tracking, Congestion Forecasting, Intersection AI',
            experience: 'Piloted at 12 major intersections reducing ambulance transit delays by 6 minutes',
            dpiitNumber: 'DIPP91823',
            foundedYear: 2022,
            stage: 'Seed',
            description: 'SafeRoute creates edge-based green corridor traffic signal priority for emergency vehicles.'
        },
        {
            name: 'EduBridge Labs',
            domain: 'Education',
            technology: 'Facial Biometric Telemetry & Student Retention Analytics',
            capabilities: 'Automated Roll-Call, Dropout Early Warning System, Mid-Day Meal Resource Audit',
            experience: 'Operational in 120 government schools tracking 45,000 students daily',
            dpiitNumber: 'DIPP44512',
            foundedYear: 2021,
            stage: 'Growth',
            description: 'EduBridge provides biometric attendance telemetry and predictive retention modeling.'
        },
        {
            name: 'EnergyLens AI',
            domain: 'Energy & Power',
            technology: 'Thermal Imaging & Acoustic Transformer Fault Prediction',
            capabilities: 'Substation Health Indexing, Outage Early Warning, Preventive Maintenance Telemetry',
            experience: 'Validated on 400 distribution transformers in state utility testbed',
            dpiitNumber: 'DIPP77812',
            foundedYear: 2023,
            stage: 'Early Stage',
            description: 'EnergyLens monitors electrical distribution assets to prevent sudden blackout cascades.'
        },
        {
            name: 'InfraWatch Systems',
            domain: 'Smart Infrastructure',
            technology: 'Mobile LiDAR Road Pavement Distress & Pothole Telemetry',
            capabilities: 'Pavement Condition Index (PCI), Automated Defect Tagging, GIS Surface Mapping',
            experience: 'Scanned 2,000 km of state highways providing high-density road quality maps',
            dpiitNumber: 'DIPP88192',
            foundedYear: 2022,
            stage: 'Seed',
            description: 'InfraWatch automates road defect mapping using vehicle-mounted LiDAR and optical telemetry.'
        }
    ];

    const startups: Record<string, string> = {};
    for (const s of startupsData) {
        const row = await prisma.startup.create({ data: s });
        startups[s.name] = row.id;
    }

    // 4. USERS
    console.log('4. Creating Users...');
    const officerHealth = await prisma.user.create({
        data: {
            email: 'gov@demo.com',
            password: pwd,
            name: 'Dr. Rajesh Varma (Nodal Officer)',
            roleId: roles['Government Officer'],
            departmentId: depts['Maharashtra Health Innovation Department']
        }
    });

    const officerUrban = await prisma.user.create({
        data: {
            email: 'officer.urban@demo.com',
            password: pwd,
            name: 'C. Sharma (Dept Director)',
            roleId: roles['Government Officer'],
            departmentId: depts['Maharashtra Urban Innovation Department']
        }
    });

    const expert = await prisma.user.create({
        data: {
            email: 'expert@demo.com',
            password: pwd,
            name: 'Dr. Arvind Kulkarni (Senior Panelist)',
            roleId: roles['Expert']
        }
    });

    const validator = await prisma.user.create({
        data: {
            email: 'validator@demo.com',
            password: pwd,
            name: 'Sovereign Audit Authority (MSIS Auditor)',
            roleId: roles['Validator']
        }
    });

    const procurementOfficer = await prisma.user.create({
        data: {
            email: 'procurement@demo.com',
            password: pwd,
            name: 'P. Deshmukh (Procurement Directorate)',
            roleId: roles['Procurement Officer'],
            departmentId: depts['Maharashtra Urban Innovation Department']
        }
    });

    const medflowUser = await prisma.user.create({
        data: {
            email: 'founder@medflow.com',
            password: pwd,
            name: 'Vikram Mehta (MedFlow Founder)',
            roleId: roles['Startup'],
            startupId: startups['MedFlow AI']
        }
    });

    const wastezeroUser = await prisma.user.create({
        data: {
            email: 'founder@wastezero.com',
            password: pwd,
            name: 'Anita Roy (WasteZero Founder)',
            roleId: roles['Startup'],
            startupId: startups['WasteZero Technologies']
        }
    });

    await prisma.user.create({
        data: {
            email: 'admin@demo.com',
            password: pwd,
            name: 'GovProof Sovereign Admin',
            roleId: roles['Admin']
        }
    });

    // 5. CHALLENGES
    console.log('5. Creating Challenges...');
    const challengesData = [
        {
            key: 'C_HOSPITAL',
            title: 'Hospital Waiting Time Reduction & Outpatient Orchestration',
            departmentId: depts['Maharashtra Health Innovation Department'],
            category: 'Healthcare',
            problemStatement: 'Outpatient departments in district civil hospitals experience acute congestion where patient wait times average 90 minutes before clinical consultation. This leads to triage delays and patient dissatisfaction.',
            description: 'Deploy an AI-driven outpatient queue management and patient flow orchestration system to lower average consultation waiting times from 90 minutes to under 45 minutes.',
            baselineValue: '90 minutes average OPD wait time',
            targetValue: '45 minutes average OPD wait time',
            budget: '₹35,00,000',
            timeline: '6 Months',
            location: 'Mumbai General District Hospital (OPD Block A & B)',
            requiredCapabilities: 'Real-time Queuing AI, EMR/HIS Integration, Doctor Triage Telemetry, Multilingual SMS/Display Tokens',
            eligibilityCriteria: 'DPIIT recognized startup with at least 1 previous clinical pilot and ISO 27001 data compliance',
            expectedOutcomes: '50% reduction in patient waiting time, improved doctor consultation throughput, zero physical queue overflow',
            status: 'COMPLETED'
        },
        {
            key: 'C_WASTE',
            title: 'Smart Waste Collection & Dynamic Route Optimization',
            departmentId: depts['Maharashtra Urban Innovation Department'],
            category: 'Waste Management',
            problemStatement: 'Municipal solid waste collection vehicles follow static routes with zero telemetry, leading to 32% bin overflow rates and inflated fuel OPEX of ₹12L/month.',
            description: 'Implement dynamic IoT bin fill-level telemetry and dynamic vehicle dispatch to cut operational fuel costs by 20% and achieve >90% on-time clearance.',
            baselineValue: '₹12L/month OPEX & 72% collection efficiency',
            targetValue: '20% cost reduction & 90% collection efficiency',
            budget: '₹25,00,000',
            timeline: '6 Months',
            location: 'Pune Municipal Corporation (Zone 4)',
            requiredCapabilities: 'Ultrasonic Bin Sensors, GPS Fleet Telemetry, Dynamic Route Planning, Municipal SCADA API',
            eligibilityCriteria: 'Demonstrated hardware reliability IP67 rating with municipal deployment experience',
            expectedOutcomes: 'Verified >20% fuel OPEX reduction, zero uncollected bins, automated audit trail for contractors',
            status: 'COMPLETED'
        },
        {
            key: 'C_WATER',
            title: 'Subterranean Water Leakage & Burst Detection Telemetry',
            departmentId: depts['Maharashtra Water & Infrastructure Department'],
            category: 'Water & Infrastructure',
            problemStatement: 'Undetected subterranean pipe fractures lead to 22% Non-Revenue Water (NRW) loss across municipal supply lines.',
            description: 'Install acoustic hydrophone telemetry sensors and transient flow AI to identify micro-fractures before road sinkholes or major line ruptures occur.',
            baselineValue: '22% Non-Revenue Water loss',
            targetValue: '<15% Non-Revenue Water loss',
            budget: '₹20,00,000',
            timeline: '4 Months',
            location: 'Nashik Municipal Water Distribution Grid',
            requiredCapabilities: 'Acoustic Leak Detection, Pressure Transient AI, GIS Grid Mapping',
            eligibilityCriteria: 'Proven sensor precision >90% in underground wet environments',
            expectedOutcomes: 'Rapid pinpointing of leaks within 12 hours of fracture initiation',
            status: 'PUBLISHED'
        },
        {
            key: 'C_SCHOOL',
            title: 'Automated Model School Attendance & Retention Monitoring',
            departmentId: depts['Maharashtra Education Innovation Department'],
            category: 'Education',
            problemStatement: 'Manual classroom roll calls have a 15% error rate and fail to identify students at risk of dropping out before unrecoverable absenteeism occurs.',
            description: 'Deploy contactless biometric attendance telemetry and automated dropout predictive models to lift verified retention to >87%.',
            baselineValue: '72% verified attendance',
            targetValue: '87% verified attendance',
            budget: '₹15,00,000',
            timeline: '6 Months',
            location: 'Aurangabad District Model Schools (Cluster 3)',
            requiredCapabilities: 'Facial Biometric Edge Terminals, Dropout Risk AI, Mid-day Meal SMS Gateway',
            eligibilityCriteria: 'Child data privacy certified and compliant with sovereign state education data guidelines',
            expectedOutcomes: 'Automated 14-day early warning for dropout intervention and 100% meal audit precision',
            status: 'PUBLISHED'
        },
        {
            key: 'C_ROAD',
            title: 'Automated Road Defect & Pothole Telemetry',
            departmentId: depts['Maharashtra Urban Innovation Department'],
            category: 'Smart Infrastructure',
            problemStatement: 'Pothole detection is reactive, causing citizen grievance delays and high road resurfacing costs with average repair cycle of 12 days.',
            description: 'Utilize vehicle-mounted optical and LiDAR scanning to automate highway defect classification and accelerate repair cycles to under 8 days.',
            baselineValue: '12 days repair cycle',
            targetValue: '8 days repair cycle & 30% faster response',
            budget: '₹30,00,000',
            timeline: '6 Months',
            location: 'Thane District PWD Arterial Roads',
            requiredCapabilities: 'Mobile LiDAR, Optical Defect Classification, Automated Work-Order Dispatch',
            eligibilityCriteria: 'Capable of scanning at standard traffic speeds up to 60 km/h',
            expectedOutcomes: 'Pavement condition index mapped in real time with rapid contractor dispatch',
            status: 'COMPLETED'
        },
        {
            key: 'C_GRIEVANCE',
            title: 'Citizen Grievance Automated NLP Classification & SLA Triage',
            departmentId: depts['Maharashtra Urban Innovation Department'],
            category: 'GovTech',
            problemStatement: 'Citizen complaints submitted in Marathi, Hindi, and English take 20 minutes to manually route to correct departmental nodal officers, resulting in SLA breaches.',
            description: 'Implement sovereign multilingual NLP models to automate ticket categorization and priority routing within 5 minutes of citizen submission.',
            baselineValue: '20 minutes manual triage latency',
            targetValue: '5 minutes automated classification',
            budget: '₹12,00,000',
            timeline: '3 Months',
            location: 'State Citizen Grievance Portal Backbone',
            requiredCapabilities: 'Multilingual Indic NLP, Automated Ticket Classification, SLA Escalation Webhooks',
            eligibilityCriteria: 'Demonstrated >90% precision on multilingual Marathi & Hindi civic text',
            expectedOutcomes: '95% reduction in ticket routing latency with zero unassigned complaints',
            status: 'DRAFT'
        }
    ];

    const challenges: Record<string, string> = {};
    for (const c of challengesData) {
        const { key, ...data } = c;
        const row = await prisma.challenge.create({ data });
        challenges[key] = row.id;

        // Create Challenge Requirements
        await prisma.challengeRequirement.create({
            data: { challengeId: row.id, description: 'Must integrate directly with departmental REST API without proprietary lock-in', isMandatory: true }
        });
        await prisma.challengeRequirement.create({
            data: { challengeId: row.id, description: 'All telemetry data must reside within Indian sovereign cloud infrastructure (MeitY empaneled)', isMandatory: true }
        });

        // Create Challenge KPIs
        if (key === 'C_HOSPITAL') {
            await prisma.challengeKPI.create({ data: { challengeId: row.id, name: 'Average Outpatient Waiting Time', metric: 'Wait Time (Min)', baseline: '90 min', target: '45 min', unit: 'Minutes' } });
            await prisma.challengeKPI.create({ data: { challengeId: row.id, name: 'Patient Throughput Efficiency', metric: 'Patients / Hour', baseline: '100/day', target: '140/day', unit: 'Pts/Day' } });
        } else if (key === 'C_WASTE') {
            await prisma.challengeKPI.create({ data: { challengeId: row.id, name: 'Monthly Fleet Fuel OPEX', metric: 'Monthly OPEX', baseline: '₹12,00,000', target: '₹9,60,000', unit: 'INR' } });
            await prisma.challengeKPI.create({ data: { challengeId: row.id, name: 'Bin Clearance Efficiency', metric: 'Clearance %', baseline: '72%', target: '90%', unit: '%' } });
        }
    }

    // 6. APPLICATIONS
    console.log('6. Creating Applications...');
    // Hospital Challenge Applications
    const appMedFlow = await prisma.application.create({
        data: {
            challengeId: challenges['C_HOSPITAL'],
            startupId: startups['MedFlow AI'],
            solutionSummary: 'MedFlow AI Queue Orchestrator combines predictive patient check-in with doctor consultation pacing algorithms to eliminate OPD physical bottlenecks.',
            proposedBudget: '₹32,00,000',
            proposedTimeline: '6 Months',
            status: 'SELECTED'
        }
    });

    const appCivicPulseHospital = await prisma.application.create({
        data: {
            challengeId: challenges['C_HOSPITAL'],
            startupId: startups['CivicPulse Technologies'],
            solutionSummary: 'SMS-based token appointment dispatcher adapted for hospital OPD registration.',
            proposedBudget: '₹22,00,000',
            proposedTimeline: '4 Months',
            status: 'SHORTLISTED'
        }
    });

    // Waste Challenge Applications
    const appWasteZero = await prisma.application.create({
        data: {
            challengeId: challenges['C_WASTE'],
            startupId: startups['WasteZero Technologies'],
            solutionSummary: 'IoT ultrasonic bin monitoring and dynamic sanitation truck route dispatch platform.',
            proposedBudget: '₹24,50,000',
            proposedTimeline: '6 Months',
            status: 'SELECTED'
        }
    });

    const appEcoGrid = await prisma.application.create({
        data: {
            challengeId: challenges['C_WASTE'],
            startupId: startups['EcoGrid Innovations'],
            solutionSummary: 'Electric sanitation vehicle battery telemetry and static cluster route optimizer.',
            proposedBudget: '₹28,00,000',
            proposedTimeline: '6 Months',
            status: 'UNDER_EVALUATION'
        }
    });

    // Road Maintenance Application
    const appInfraRoad = await prisma.application.create({
        data: {
            challengeId: challenges['C_ROAD'],
            startupId: startups['InfraWatch Systems'],
            solutionSummary: 'Vehicle-mounted optical scanner for road defect mapping and automated GIS tagging.',
            proposedBudget: '₹29,00,000',
            proposedTimeline: '6 Months',
            status: 'SELECTED'
        }
    });

    // Water Application
    await prisma.application.create({
        data: {
            challengeId: challenges['C_WATER'],
            startupId: startups['WaterSense Labs'],
            solutionSummary: 'Acoustic pipe telemetry and transient flow pressure micro-burst detection.',
            proposedBudget: '₹19,00,000',
            proposedTimeline: '4 Months',
            status: 'ELIGIBLE'
        }
    });

    // 7. EVALUATIONS
    console.log('7. Creating Expert Evaluations...');
    const evalMedFlow = await prisma.evaluation.create({
        data: {
            applicationId: appMedFlow.id,
            expertId: expert.id,
            status: 'SUBMITTED',
            overallScore: 93,
            comments: 'MedFlow AI demonstrated clear technical superiority. The hospital pilot architecture features low clinical staff burden, robust patient data privacy, and strong predictive queuing algorithms.',
            declaredNoConflict: true
        }
    });

    const criteriaMedFlow = [
        { category: 'Problem Fit & Alignment', score: 96, weight: 0.25 },
        { category: 'Technical Feasibility', score: 94, weight: 0.20 },
        { category: 'Cost Effectiveness', score: 90, weight: 0.15 },
        { category: 'Scalability', score: 92, weight: 0.15 },
        { category: 'Security & Compliance', score: 95, weight: 0.10 },
        { category: 'Startup Readiness', score: 92, weight: 0.10 },
        { category: 'Sustainability', score: 88, weight: 0.05 }
    ];
    for (const c of criteriaMedFlow) {
        await prisma.evaluationScore.create({ data: { evaluationId: evalMedFlow.id, ...c } });
    }

    const evalWasteZero = await prisma.evaluation.create({
        data: {
            applicationId: appWasteZero.id,
            expertId: expert.id,
            status: 'SUBMITTED',
            overallScore: 91,
            comments: 'Solid IoT sensor architecture with verified IP67 outdoor ruggedness and strong algorithmic fuel routing.',
            declaredNoConflict: true
        }
    });

    const criteriaWasteZero = [
        { category: 'Problem Fit & Alignment', score: 95, weight: 0.25 },
        { category: 'Technical Feasibility', score: 92, weight: 0.20 },
        { category: 'Cost Effectiveness', score: 88, weight: 0.15 },
        { category: 'Scalability', score: 90, weight: 0.15 },
        { category: 'Security & Compliance', score: 90, weight: 0.10 },
        { category: 'Startup Readiness', score: 92, weight: 0.10 },
        { category: 'Sustainability', score: 85, weight: 0.05 }
    ];
    for (const c of criteriaWasteZero) {
        await prisma.evaluationScore.create({ data: { evaluationId: evalWasteZero.id, ...c } });
    }

    // 8. PILOTS
    console.log('8. Creating Pilots...');
    // Flagship Demo Pilot: MedFlow AI
    const pilotHospital = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C_HOSPITAL'],
            applicationId: appMedFlow.id,
            startupId: startups['MedFlow AI'],
            status: 'COMPLETED',
            pilotLocation: 'Mumbai General District Hospital (OPD Block A & B)',
            startDate: new Date(Date.now() - 120 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
            objectives: 'Reduce outpatient consultation waiting time from 90 minutes to under 45 minutes across high-density general medicine and pediatric clinics.',
            baseline: '90 minutes wait time; 100 patients/day throughput',
            target: '45 minutes wait time; 140 patients/day throughput (50% wait reduction)',
            actual: '48 minutes wait time; 138 patients/day throughput (47% verified wait reduction)',
            risks: 'Intermittent OPD network latency handled via local edge fallback buffer.',
            ownerId: officerHealth.id
        }
    });

    // Waste Pilot (Completed & Scaled)
    const pilotWaste = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C_WASTE'],
            applicationId: appWasteZero.id,
            startupId: startups['WasteZero Technologies'],
            status: 'COMPLETED',
            pilotLocation: 'Pune Municipal Corporation (Zone 4 - Kothrud & Karve Road)',
            startDate: new Date(Date.now() - 180 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
            objectives: 'Reduce municipal sanitation vehicle fuel consumption by 20% and maintain >90% bin clearance.',
            baseline: '₹12L/month fuel expenditure; 72% collection efficiency',
            target: '20% OPEX reduction (₹9.6L/mo); 90% collection efficiency',
            actual: '27% OPEX reduction (₹8.76L/mo); 92% collection efficiency',
            risks: 'Minor bin vandalism mitigated through tamper-detection alerts.',
            ownerId: officerUrban.id
        }
    });

    // Road Maintenance Pilot (Failed / Did not meet baseline)
    const pilotRoad = await prisma.pilotProject.create({
        data: {
            challengeId: challenges['C_ROAD'],
            applicationId: appInfraRoad.id,
            startupId: startups['InfraWatch Systems'],
            status: 'FAILED',
            pilotLocation: 'Thane District PWD Highway Zone 2',
            startDate: new Date(Date.now() - 150 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
            objectives: 'Accelerate road pothole defect detection to repair turnaround from 12 days to under 8 days.',
            baseline: '12 days repair cycle',
            target: '8 days repair cycle (30% improvement)',
            actual: '10.7 days repair cycle (only 11% improvement achieved)',
            risks: 'High optical camera glare during monsoon and low contractor adoption.',
            ownerId: officerUrban.id
        }
    });

    // 9. PILOT KPIS
    console.log('9. Creating Pilot KPIs...');
    // Hospital KPIs
    const kpiWaitTime = await prisma.pilotKPI.create({
        data: {
            pilotId: pilotHospital.id,
            name: 'Average Outpatient Waiting Time',
            description: 'Elapsed minutes from patient arrival token generation to doctor consultation entry',
            unit: 'Minutes',
            baseline: '90 min',
            target: '45 min',
            actual: '48 min',
            measurementPeriod: 'Daily telemetry averaged over 90 days',
            source: 'Hospital Information System (HIS) API Telemetry',
            status: 'ACHIEVED'
        }
    });

    const kpiThroughput = await prisma.pilotKPI.create({
        data: {
            pilotId: pilotHospital.id,
            name: 'Patient Consultation Throughput',
            description: 'Number of completed clinical consultations per outpatient doctor room per day',
            unit: 'Patients/Day',
            baseline: '100 pts/day',
            target: '140 pts/day',
            actual: '138 pts/day',
            measurementPeriod: 'Monthly clinic audit aggregate',
            source: 'Doctor EMR Triage Timestamp Ledger',
            status: 'ACHIEVED'
        }
    });

    const kpiCSAT = await prisma.pilotKPI.create({
        data: {
            pilotId: pilotHospital.id,
            name: 'Patient Satisfaction Index (CSAT)',
            description: 'Percentage of patients rating queue experience as Good or Excellent on exit kiosk',
            unit: '%',
            baseline: '52%',
            target: '85%',
            actual: '89%',
            measurementPeriod: 'Daily exit survey kiosk telemetry (N=14,200)',
            source: 'OPD Digital Exit Survey Kiosk',
            status: 'ACHIEVED'
        }
    });

    // Waste KPIs
    const kpiWasteCost = await prisma.pilotKPI.create({
        data: {
            pilotId: pilotWaste.id,
            name: 'Monthly Fleet Fuel OPEX',
            description: 'Total monthly fuel and vehicle wear expenditure across 35 sanitation vehicles',
            unit: 'INR',
            baseline: '₹12,00,000',
            target: '₹9,60,000',
            actual: '₹8,76,000',
            measurementPeriod: 'Monthly municipal fuel log book',
            source: 'Municipal Fuel Dispenser & GPS Telemetry',
            status: 'ACHIEVED'
        }
    });

    const kpiWasteEff = await prisma.pilotKPI.create({
        data: {
            pilotId: pilotWaste.id,
            name: 'Collection Efficiency Rate',
            description: 'Percentage of municipal bins cleared prior to 80% fill threshold',
            unit: '%',
            baseline: '72%',
            target: '90%',
            actual: '92%',
            measurementPeriod: 'Continuous IoT ultrasonic ping telemetry',
            source: 'IoT Ultrasonic Bin Sensors',
            status: 'ACHIEVED'
        }
    });

    // Road KPI
    await prisma.pilotKPI.create({
        data: {
            pilotId: pilotRoad.id,
            name: 'Defect-to-Repair Cycle',
            description: 'Days elapsed from automatic LiDAR defect tagging to physical pothole bitumen patch',
            unit: 'Days',
            baseline: '12 days',
            target: '8 days',
            actual: '10.7 days',
            measurementPeriod: 'Quarterly PWD contractor log',
            source: 'PWD Maintenance Portal',
            status: 'MISSED'
        }
    });

    // 10. PILOT MILESTONES & PAYMENTS
    console.log('10. Creating Milestones & Payments...');
    // Hospital Milestones
    const mHosp1 = await prisma.pilotMilestone.create({
        data: {
            pilotId: pilotHospital.id,
            title: 'Milestone 1: Telemetry Hardware & EMR API Gateway Setup',
            description: 'Installation of token kiosks, clinic room displays, and secure HIS API link',
            dueDate: new Date(Date.now() - 100 * 24 * 3600 * 1000),
            completionDate: new Date(Date.now() - 98 * 24 * 3600 * 1000),
            amount: 1000000,
            status: 'COMPLETED',
            deliverable: 'Deployment Architecture Sign-off & HIS API Handshake Report',
            evidenceRequirement: 'Installation Certificate signed by Hospital Medical Superintendent'
        }
    });

    const mHosp2 = await prisma.pilotMilestone.create({
        data: {
            pilotId: pilotHospital.id,
            title: 'Milestone 2: 60-Day Active Live Telemetry & Queue Optimization',
            description: 'Execution of live patient flow optimization across OPD General Medicine and Pediatrics',
            dueDate: new Date(Date.now() - 40 * 24 * 3600 * 1000),
            completionDate: new Date(Date.now() - 38 * 24 * 3600 * 1000),
            amount: 1500000,
            status: 'COMPLETED',
            deliverable: 'Interim Queue Performance & Waiting Time Telemetry Dataset',
            evidenceRequirement: 'Validated HIS log extracts and raw token timestamp audit'
        }
    });

    const mHosp3 = await prisma.pilotMilestone.create({
        data: {
            pilotId: pilotHospital.id,
            title: 'Milestone 3: Final Pilot Outcome & Verification Audit Report',
            description: 'Comprehensive 90-day evaluation, patient satisfaction surveys, and independent validation',
            dueDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
            completionDate: new Date(Date.now() - 12 * 24 * 3600 * 1000),
            amount: 1000000,
            status: 'COMPLETED',
            deliverable: 'Final Pilot Outcome Dossier and Scale Readiness Blueprint',
            evidenceRequirement: 'Independent Validator Sign-off and Patient CSAT Summary'
        }
    });

    // Payments for Hospital Milestones
    await prisma.payment.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp1.id,
            amount: 1000000,
            status: 'PAID',
            dueDate: new Date(Date.now() - 95 * 24 * 3600 * 1000),
            paymentDate: new Date(Date.now() - 92 * 24 * 3600 * 1000)
        }
    });
    await prisma.payment.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp2.id,
            amount: 1500000,
            status: 'PAID',
            dueDate: new Date(Date.now() - 35 * 24 * 3600 * 1000),
            paymentDate: new Date(Date.now() - 30 * 24 * 3600 * 1000)
        }
    });
    await prisma.payment.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp3.id,
            amount: 1000000,
            status: 'APPROVED',
            dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000)
        }
    });

    // 11. EVIDENCE VAULT
    console.log('11. Creating Evidence Vault Artifacts...');
    // MedFlow Hospital Evidence
    await prisma.evidence.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp1.id,
            kpiId: kpiWaitTime.id,
            title: 'Hospital OPD Baseline & API Telemetry Integration Certificate',
            description: 'Official verification of baseline measurements (90 min) and EMR integration signed by Hospital Superintendent',
            uploadedById: medflowUser.id,
            fileUrl: 'MedFlow_Mumbai_General_Baseline_Audit.pdf',
            fileType: 'PDF',
            verifiedStatus: 'VERIFIED',
            reviewComments: 'HIS system integration and baseline data timestamp verified by nodal auditor.',
            reviewerId: validator.id
        }
    });

    await prisma.evidence.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp2.id,
            kpiId: kpiWaitTime.id,
            title: '90-Day Raw Queue Telemetry & Time-in-Motion Dataset',
            description: 'Complete dataset containing 42,600 patient token timestamps showing wait time reduction to 48 minutes average',
            uploadedById: medflowUser.id,
            fileUrl: 'MedFlow_OPD_Telemetry_Dataset_Q3.csv',
            fileType: 'CSV / Dataset',
            verifiedStatus: 'VERIFIED',
            reviewComments: 'Empirical verification confirmed across telemetry sample with 46.7% average reduction.',
            reviewerId: validator.id
        }
    });

    await prisma.evidence.create({
        data: {
            pilotId: pilotHospital.id,
            milestoneId: mHosp3.id,
            kpiId: kpiCSAT.id,
            title: 'Patient Exit CSAT Kiosk Survey Analytics & Video Audit',
            description: '14,200 validated patient exit survey responses recording 89% positive CSAT rating',
            uploadedById: medflowUser.id,
            fileUrl: 'Patient_CSAT_Audit_Report_2026.pdf',
            fileType: 'PDF Report',
            verifiedStatus: 'VERIFIED',
            reviewComments: 'Kiosk survey logs cross-matched with token issuance IDs without anomalies.',
            reviewerId: validator.id
        }
    });

    // WasteZero Evidence
    await prisma.evidence.create({
        data: {
            pilotId: pilotWaste.id,
            kpiId: kpiWasteCost.id,
            title: 'Pune Municipal Zone 4 Fuel Telemetry Log & Weighbridge Audit',
            description: 'Quarterly municipal diesel consumption logs verifying ₹8.76L/month expenditure vs ₹12L baseline',
            uploadedById: wastezeroUser.id,
            fileUrl: 'WasteZero_PMC_Zone4_Fuel_Audit.pdf',
            fileType: 'PDF Report',
            verifiedStatus: 'VERIFIED',
            reviewComments: 'Municipal accounts and GPS fuel logs matched with 27% savings.',
            reviewerId: validator.id
        }
    });

    // Road Evidence
    await prisma.evidence.create({
        data: {
            pilotId: pilotRoad.id,
            title: 'Thane Highway LiDAR Road Defect Scan & Contractor Work Orders',
            description: 'LiDAR point-cloud telemetry showing 10.7 day average repair cycle against 8-day target',
            uploadedById: officerUrban.id,
            fileUrl: 'InfraWatch_Thane_Defect_Log.pdf',
            fileType: 'PDF Report',
            verifiedStatus: 'REJECTED',
            reviewComments: 'Failed to meet 8-day target due to contractor work order latency and camera weather outages.',
            reviewerId: validator.id
        }
    });

    // 12. INDEPENDENT VALIDATION RECORDS
    console.log('12. Creating Independent Validation Records...');
    // MedFlow Validation (Flagship)
    await prisma.validationRecord.create({
        data: {
            pilotId: pilotHospital.id,
            validatorId: validator.id,
            decision: 'VALIDATED',
            methodology: 'Dual-method validation: 1) Cryptographic timestamp matching between HIS token issuance and doctor consultation closure, 2) Random sample on-site physical time-in-motion audits of 250 patients across 5 clinic days.',
            findings: 'Average outpatient wait time was reduced from 90 minutes (baseline) to 48 minutes (actual), representing a verified 46.7% improvement. Doctor consultation throughput rose from 100 to 138 patients/day. Patient CSAT reached 89%. Data source integrity from Hospital Information System is verified as tamper-free.',
            confidence: 'High (98.4% Confidence Interval)',
            comments: 'The innovation has conclusively demonstrated technical feasibility, operational stability, and clinical impact in an active tertiary government hospital environment. Highly recommended for state-wide scaling.'
        }
    });

    // WasteZero Validation
    await prisma.validationRecord.create({
        data: {
            pilotId: pilotWaste.id,
            validatorId: validator.id,
            decision: 'VALIDATED',
            methodology: 'GPS telemetry playback correlated with municipal fuel pump meters and weighbridge receipts over a 180-day continuous operating window.',
            findings: 'Municipal fuel expenditure fell by 27.0% from ₹12.0L/mo baseline to ₹8.76L/mo actual. Bin clearance on-time efficiency registered at 92.0% (target 90%). System availability logged at 99.4% uptime.',
            confidence: 'High',
            comments: 'Fully verified for scale procurement across remaining municipal corporation zones.'
        }
    });

    // Road Validation (Rejected)
    await prisma.validationRecord.create({
        data: {
            pilotId: pilotRoad.id,
            validatorId: validator.id,
            decision: 'REJECTED',
            methodology: 'Comparison of LiDAR defect detection logs against PWD contractor physical completion dates.',
            findings: 'Repair turnaround averaged 10.7 days, significantly falling short of the mandatory 8-day SLA threshold. Optical sensors experienced a 34% drop in precision during precipitation.',
            confidence: 'High',
            comments: 'Pilot failed to meet core target KPI. Hardware ruggedization and contractor integration required before re-testing.'
        }
    });

    // 13. PROOF PASSPORTS (THE CORE DIFFERENTIATOR)
    console.log('13. Generating Innovation Proof Passports...');
    // MedFlow AI Passport
    const medflowSnapshot = {
        passportNumber: 'GPP-MH-2026-0042',
        problem: 'Outpatient departments in district civil hospitals experience acute congestion where patient wait times average 90 minutes before clinical consultation, leading to overcrowding and delayed clinical triage.',
        challenge: 'Hospital Waiting Time Reduction & Outpatient Orchestration',
        department: 'Maharashtra Health Innovation Department',
        startup: 'MedFlow AI',
        solution: 'AI-assisted Outpatient Queue Optimization & Telemetry Routing',
        pilotLocation: 'Mumbai General District Hospital (OPD Block A & B)',
        pilotDuration: '110 Days (4 Months Active Live Testing)',
        startDate: '2025-11-15',
        endDate: '2026-03-05',
        baselineKPIs: [
            { name: 'Average Outpatient Waiting Time', value: '90 minutes' },
            { name: 'Patient Consultation Throughput', value: '100 patients/day' },
            { name: 'Patient Satisfaction Score (CSAT)', value: '52%' }
        ],
        targetKPIs: [
            { name: 'Average Outpatient Waiting Time', value: '45 minutes' },
            { name: 'Patient Consultation Throughput', value: '140 patients/day' },
            { name: 'Patient Satisfaction Score (CSAT)', value: '85%' }
        ],
        actualKPIs: [
            { name: 'Average Outpatient Waiting Time', value: '48 minutes', improvement: '46.7% reduction', status: 'ACHIEVED' },
            { name: 'Patient Consultation Throughput', value: '138 patients/day', improvement: '+38.0% increase', status: 'ACHIEVED' },
            { name: 'Patient Satisfaction Score (CSAT)', value: '89%', improvement: '+37.0% increase', status: 'ACHIEVED' }
        ],
        evidenceSubmitted: [
            { title: 'Hospital OPD Baseline & API Telemetry Integration Certificate', type: 'PDF', status: 'VERIFIED' },
            { title: '90-Day Raw Queue Telemetry & Time-in-Motion Dataset (42,600 Records)', type: 'CSV / Dataset', status: 'VERIFIED' },
            { title: 'Patient Exit CSAT Kiosk Survey Analytics & Video Audit', type: 'PDF Report', status: 'VERIFIED' }
        ],
        independentValidation: {
            validator: 'Sovereign Audit Authority (MSIS Auditor)',
            status: 'VALIDATED',
            methodology: 'Dual-method validation: 1) Cryptographic timestamp matching between HIS token issuance and doctor consultation closure, 2) Random sample on-site physical time-in-motion audits of 250 patients across 5 clinic days.',
            findings: 'Average outpatient wait time was reduced from 90 minutes (baseline) to 48 minutes (actual), representing a verified 46.7% improvement. Doctor throughput reached 138/day. CSAT reached 89%. Zero data tampering detected.',
            confidence: 'High (98.4% Confidence Interval)'
        },
        risks: [
            { description: 'Hospital LAN network downtime in remote annexes', mitigation: 'Local edge buffer mode stores queue states offline for up to 8 hours' }
        ],
        milestonesCompleted: '3 of 3 Milestones Verified & Approved (100%)',
        overallOutcome: 'SUCCESS — PILOT OBJECTIVES EXCEEDED',
        scaleReadinessScore: 92,
        scaleReadinessCategory: 'READY TO SCALE',
        recommendedNextAction: 'PROCEED TO PROCUREMENT',
        procurementReadiness: 'PROCUREMENT READY (Fast-Track DPIIT Exemption Eligible)',
        validationTimestamp: new Date().toISOString(),
        auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    await prisma.proofPassport.create({
        data: {
            pilotId: pilotHospital.id,
            passportNumber: 'GPP-MH-2026-0042',
            auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            dataSnapshot: JSON.stringify(medflowSnapshot)
        }
    });

    // WasteZero Passport
    const wasteSnapshot = {
        passportNumber: 'GPP-MH-2026-0018',
        problem: 'Municipal solid waste collection vehicles follow static routes with zero telemetry, leading to 32% bin overflow rates and inflated fuel OPEX of ₹12L/month.',
        challenge: 'Smart Waste Collection & Dynamic Route Optimization',
        department: 'Maharashtra Urban Innovation Department',
        startup: 'WasteZero Technologies',
        solution: 'Ultrasonic Bin Fill-Level IoT & Dynamic Route Dispatch',
        pilotLocation: 'Pune Municipal Corporation (Zone 4 - Kothrud & Karve Road)',
        pilotDuration: '150 Days (5 Months Active Testing)',
        startDate: '2025-09-10',
        endDate: '2026-02-10',
        baselineKPIs: [
            { name: 'Monthly Fleet Fuel OPEX', value: '₹12,00,000' },
            { name: 'Collection Efficiency Rate', value: '72%' }
        ],
        targetKPIs: [
            { name: 'Monthly Fleet Fuel OPEX', value: '₹9,60,000' },
            { name: 'Collection Efficiency Rate', value: '90%' }
        ],
        actualKPIs: [
            { name: 'Monthly Fleet Fuel OPEX', value: '₹8,76,000', improvement: '27% reduction', status: 'ACHIEVED' },
            { name: 'Collection Efficiency Rate', value: '92%', improvement: '+20% increase', status: 'ACHIEVED' }
        ],
        evidenceSubmitted: [
            { title: 'Pune Municipal Zone 4 Fuel Telemetry Log & Weighbridge Audit', type: 'PDF Report', status: 'VERIFIED' }
        ],
        independentValidation: {
            validator: 'Sovereign Audit Authority (MSIS Auditor)',
            status: 'VALIDATED',
            methodology: 'GPS telemetry playback correlated with municipal fuel pump meters and weighbridge receipts over a 180-day continuous operating window.',
            findings: 'Fuel OPEX fell by 27.0%. Bin clearance efficiency registered at 92.0%. 99.4% uptime.',
            confidence: 'High'
        },
        risks: [
            { description: 'Physical sensor vandalism', mitigation: 'Anti-tamper enclosure with automated tilt alarms' }
        ],
        milestonesCompleted: '3 of 3 Milestones Completed (100%)',
        overallOutcome: 'SUCCESS — SCALED STATE-WIDE',
        scaleReadinessScore: 94,
        scaleReadinessCategory: 'READY TO SCALE',
        recommendedNextAction: 'SCALE',
        procurementReadiness: 'PROCUREMENT READY',
        validationTimestamp: new Date().toISOString(),
        auditHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'
    };

    await prisma.proofPassport.create({
        data: {
            pilotId: pilotWaste.id,
            passportNumber: 'GPP-MH-2026-0018',
            auditHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
            dataSnapshot: JSON.stringify(wasteSnapshot)
        }
    });

    // 14. SCALE DECISIONS & PROCUREMENT RECORDS
    console.log('14. Creating Scale Decisions & Procurement Records...');
    // MedFlow Scale Decision
    const scaleMedFlow = await prisma.scaleDecision.create({
        data: {
            pilotId: pilotHospital.id,
            decisionById: officerHealth.id,
            recommendation: 'PROCEED TO PROCUREMENT',
            finalDecision: 'PROCEED TO PROCUREMENT',
            reason: 'Pilot demonstrated 46.7% outpatient wait time reduction with high clinical stability and zero adverse incidents.',
            comments: 'Approved for state procurement scaling across 14 additional district hospitals under State Health Mission.',
            readinessScore: 92
        }
    });

    await prisma.procurementRecord.create({
        data: {
            scaleDecisionId: scaleMedFlow.id,
            tenderDocUrl: 'Tender_Draft_MH_Health_OPD_AI_2026.pdf',
            status: 'PROCUREMENT READY',
            specifications: JSON.stringify({
                tenderTitle: 'Deployment of AI Outpatient Queue Orchestration across 14 District Hospitals',
                estimatedValue: '₹4,80,00,000',
                contractPeriod: '3 Years',
                baselineSpec: 'Minimum verified wait time reduction >= 40%; 99.5% API availability; EMR compliance',
                fastTrackEligible: true
            }),
            contractReadiness: 'READY',
            documentationCompleteness: 'COMPLETE',
            securityReadiness: 'CERTIFIED',
            riskStatus: 'LOW'
        }
    });

    // WasteZero Scale Decision
    const scaleWaste = await prisma.scaleDecision.create({
        data: {
            pilotId: pilotWaste.id,
            decisionById: officerUrban.id,
            recommendation: 'SCALE',
            finalDecision: 'SCALE',
            reason: 'Consistently exceeded target with 27% operational fuel reduction across 5 months.',
            comments: 'State-wide master contract approved for all Tier-1 municipal corporations.',
            readinessScore: 94
        }
    });

    await prisma.procurementRecord.create({
        data: {
            scaleDecisionId: scaleWaste.id,
            tenderDocUrl: 'Tender_Master_PMC_WasteZero_2026.pdf',
            status: 'PROCUREMENT READY',
            specifications: JSON.stringify({
                tenderTitle: 'State-wide Municipal Solid Waste IoT Telemetry & Routing Framework',
                estimatedValue: '₹12,00,00,000',
                contractPeriod: '5 Years',
                fastTrackEligible: true
            }),
            contractReadiness: 'READY',
            documentationCompleteness: 'COMPLETE',
            securityReadiness: 'CERTIFIED',
            riskStatus: 'LOW'
        }
    });

    // Road Scale Decision (Do Not Scale)
    await prisma.scaleDecision.create({
        data: {
            pilotId: pilotRoad.id,
            decisionById: officerUrban.id,
            recommendation: 'STOP',
            finalDecision: 'STOP',
            reason: 'Pilot did not meet 8-day repair SLA (actual 10.7 days). Optical sensor reliability degraded during rain.',
            comments: 'Discontinue deployment until hardware weatherproofing and contractor integrations are re-engineered.',
            readinessScore: 32
        }
    });

    // 15. AUDIT LOGS
    console.log('15. Creating Audit Trail...');
    const auditLogs = [
        { action: 'CHALLENGE_CREATED', entity: 'Challenge', entityId: challenges['C_HOSPITAL'], userId: officerHealth.id, details: JSON.stringify({ title: 'Hospital Waiting Time Reduction' }) },
        { action: 'CHALLENGE_PUBLISHED', entity: 'Challenge', entityId: challenges['C_HOSPITAL'], userId: officerHealth.id, details: JSON.stringify({ status: 'PUBLISHED' }) },
        { action: 'STARTUP_APPLIED', entity: 'Application', entityId: appMedFlow.id, userId: medflowUser.id, details: JSON.stringify({ startup: 'MedFlow AI' }) },
        { action: 'APPLICATION_SHORTLISTED', entity: 'Application', entityId: appMedFlow.id, userId: officerHealth.id, details: JSON.stringify({ status: 'SHORTLISTED' }) },
        { action: 'EVALUATION_SUBMITTED', entity: 'Evaluation', entityId: evalMedFlow.id, userId: expert.id, details: JSON.stringify({ overallScore: 93 }) },
        { action: 'APPLICATION_SELECTED', entity: 'Application', entityId: appMedFlow.id, userId: officerHealth.id, details: JSON.stringify({ status: 'SELECTED' }) },
        { action: 'PILOT_INITIATED', entity: 'PilotProject', entityId: pilotHospital.id, userId: officerHealth.id, details: JSON.stringify({ location: 'Mumbai General Hospital' }) },
        { action: 'EVIDENCE_UPLOADED', entity: 'Evidence', entityId: pilotHospital.id, userId: medflowUser.id, details: JSON.stringify({ file: 'MedFlow_OPD_Telemetry_Dataset_Q3.csv' }) },
        { action: 'VALIDATION_COMPLETED', entity: 'ValidationRecord', entityId: pilotHospital.id, userId: validator.id, details: JSON.stringify({ decision: 'VALIDATED', confidence: 'High' }) },
        { action: 'PROOF_PASSPORT_GENERATED', entity: 'ProofPassport', entityId: 'GPP-MH-2026-0042', userId: validator.id, details: JSON.stringify({ passportNumber: 'GPP-MH-2026-0042' }) },
        { action: 'SCALE_DECISION_RECORDED', entity: 'ScaleDecision', entityId: scaleMedFlow.id, userId: officerHealth.id, details: JSON.stringify({ decision: 'PROCEED TO PROCUREMENT' }) }
    ];

    for (const a of auditLogs) {
        await prisma.auditLog.create({ data: a });
    }

    console.log('[GovProof Seed] Complete! Database successfully populated with realistic government innovation pipeline.');
}

main()
    .catch((e) => {
        console.error('[GovProof Seed Error]:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
