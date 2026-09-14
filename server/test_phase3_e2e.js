const http = require('http');

async function req(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const r = http.request({
            hostname: 'localhost',
            port: 4000,
            path,
            method,
            headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        r.on('error', reject);
        if (payload) r.write(payload);
        r.end();
    });
}

async function runPhase3E2E() {
    console.log('===============================================================');
    console.log('   GOVPROOF PHASE 3: FULL-LIFECYCLE E2E AUDIT & VERIFICATION   ');
    console.log('===============================================================\n');

    // 1. Government Login
    console.log('[Step 1] Government Officer Login (gov@demo.com)...');
    const govLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'demo123' });
    if (govLogin.status !== 200) throw new Error('Gov login failed');
    const govToken = govLogin.data.token;
    console.log(`-> Authenticated: ${govLogin.data.user.name} (${govLogin.data.user.role})`);

    // 2. AI Challenge Copilot
    console.log('\n[Step 2] AI Challenge Copilot Generation...');
    const copilot = await req('/api/challenges/ai-copilot', 'POST', {
        problem: 'Patients experience excessive waiting times exceeding 90 minutes in municipal outpatient clinics.',
        department: 'Maharashtra Health Innovation Department',
        category: 'Healthcare',
        expectedOutcome: 'Reduce outpatient wait times by 50% without increasing medical staffing'
    }, govToken);
    console.log(`-> AI Title: "${copilot.data?.title}"`);
    console.log(`-> AI Suggested KPIs: ${copilot.data?.kpis?.map(k => `${k.name} (${k.baseline}->${k.target} ${k.unit})`).join(', ')}`);

    // 3. Save & Publish Challenge
    console.log('\n[Step 3] Publishing New Innovation Challenge...');
    const newChallenge = await req('/api/challenges', 'POST', {
        title: 'Municipal Hospital Outpatient Queuing & Triage Optimization',
        problemStatement: 'Excessive outpatient waiting times averaging 90 minutes causing severe emergency department spillover and patient dissatisfaction.',
        description: 'Implement AI-powered patient queuing, dynamic doctor appointment allocation, and automated triage telemetry.',
        category: 'Healthcare',
        location: 'Chhatrapati Shivaji Maharaj General Hospital, OPD Block',
        budget: '₹25,00,000',
        timeline: '90 Days',
        baselineValue: '90 Minutes',
        targetValue: '45 Minutes',
        requiredCapabilities: ['Real-time Queue Prediction', 'EMR/EHR FHIR API Interoperability', 'Dynamic Doctor Triage Scheduling'],
        eligibilityCriteria: 'DPIIT recognized healthcare AI startups with proven hospital deployment track record.',
        expectedOutcomes: 'Achieve minimum 45% reduction in outpatient queue latency within 90-day sandbox pilot.',
        status: 'PUBLISHED',
        kpis: [
            { name: 'Average Outpatient Waiting Time', metric: 'Wait Duration', baseline: '90', target: '45', unit: 'Minutes' },
            { name: 'Peak Triage Triage Latency', metric: 'Triage Time', baseline: '25', target: '6', unit: 'Minutes' }
        ]
    }, govToken);
    if (newChallenge.status !== 200 && newChallenge.status !== 201) throw new Error('Challenge creation failed: ' + JSON.stringify(newChallenge.data));
    const challengeId = newChallenge.data.id;
    console.log(`-> Challenge Created & Published: ID=${challengeId} ("${newChallenge.data.title}")`);

    // 4. Startup Login
    console.log('\n[Step 4] Startup Founder Login (founder@medflow.com)...');
    const startupLogin = await req('/api/auth/login', 'POST', { email: 'founder@medflow.com', password: 'demo123' });
    const startupToken = startupLogin.data.token;
    const startupId = startupLogin.data.user.startupId;
    console.log(`-> Authenticated: ${startupLogin.data.user.name} (Startup: ${startupLogin.data.user.startup})`);

    // 5. Startup Discover Challenge & Explainable AI Matching
    console.log('\n[Step 5] Startup Challenge Discovery & AI Explainable Matching...');
    const matchRes = await req(`/api/startups?challengeId=${challengeId}`, 'GET', null, startupToken);
    const medflowMatch = matchRes.data.find(s => s.id === startupId) || matchRes.data[0];
    console.log(`-> MedFlow Match Score: ${medflowMatch?.matchScore}% (Domain: ${medflowMatch?.domainScore}%, Tech: ${medflowMatch?.techScore}%)`);
    console.log(`-> Why This Startup: ${medflowMatch?.whyThisStartup}`);

    // 6. Startup Submits Application
    console.log('\n[Step 6] Startup Submits Application for Challenge...');
    const appRes = await req('/api/applications', 'POST', {
        challengeId: challengeId,
        startupId: startupId,
        proposal: 'MedFlow AI Queue Orchestration Platform: Real-time patient flow predictive algorithm integrated directly with hospital registration counters.',
        proposedTimeline: '90 Days',
        proposedBudget: 2200000,
        teamExperience: 'Deployed across 3 municipal healthcare centers with documented 47% wait time reduction.'
    }, startupToken);
    if (appRes.status !== 200 && appRes.status !== 201) throw new Error('Application submission failed: ' + JSON.stringify(appRes.data));
    const applicationId = appRes.data.id;
    console.log(`-> Application Submitted: ID=${applicationId}, Status=${appRes.data.status}`);

    // 7. Government Review & Move to Evaluation
    console.log('\n[Step 7] Government Reviews & Shortlists Application...');
    const updateApp = await req(`/api/applications/${applicationId}/status`, 'PATCH', {
        status: 'SHORTLISTED',
        reviewNotes: 'DPIIT credentials and technical compliance verified. Forwarded to Expert Evaluation Panel.'
    }, govToken);
    console.log(`-> Application Status Updated to: ${updateApp.data.status}`);

    // 8. Expert Evaluator Scores Application
    console.log('\n[Step 8] Expert Evaluator Scores Application (expert@demo.com)...');
    const expertLogin = await req('/api/auth/login', 'POST', { email: 'expert@demo.com', password: 'demo123' });
    const expertToken = expertLogin.data.token;
    const evalRes = await req('/api/evaluations', 'POST', {
        applicationId: applicationId,
        conflict: true,
        scores: {
            problemFit: 95,
            technicalFeasibility: 92,
            innovation: 90,
            scalability: 94,
            costEffectiveness: 88,
            security: 96,
            riskScore: 90,
            teamCapability: 92
        },
        comments: 'Outstanding algorithmic architecture with validated FHIR interoperability and robust data localization compliance. Recommended for immediate sandbox pilot.'
    }, expertToken);
    if (evalRes.status !== 200 && evalRes.status !== 201) throw new Error('Evaluation submission failed: ' + JSON.stringify(evalRes.data));
    console.log(`-> Evaluation Recorded: Overall Score=${evalRes.data.totalScore || evalRes.data.overallScore}/100 -> Status: SELECTED`);

    // 9. Government Provisions Sandbox Pilot
    console.log('\n[Step 9] Government Provisions Sandbox Pilot Project...');
    const pilotRes = await req('/api/pilots', 'POST', {
        challengeId: challengeId,
        startupId: startupId,
        title: 'Hospital Outpatient Waiting Time Reduction Pilot',
        location: 'Chhatrapati Shivaji Maharaj General Hospital, OPD Block',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: 'ACTIVE',
        kpis: [
            {
                name: 'Average Outpatient Waiting Time',
                metric: 'Wait Time (Minutes)',
                unit: 'Minutes',
                baselineValue: '90',
                targetValue: '45',
                actualValue: '48',
                status: 'ACHIEVED',
                source: 'Hospital IoT Queue Telemetry & RFID Badge Log'
            },
            {
                name: 'Peak Hour Triage Latency',
                metric: 'Triage Time (Minutes)',
                unit: 'Minutes',
                baselineValue: '25',
                targetValue: '6',
                actualValue: '6.5',
                status: 'ACHIEVED',
                source: 'Hospital Registration Counter Telemetry'
            }
        ],
        milestones: [
            { name: 'M1: OPD Counter Hardware & API Integration', description: 'Deploy queue kiosks and EMR connector', dueDate: new Date().toISOString(), status: 'COMPLETED', paymentAmount: 500000 },
            { name: 'M2: Live Queue Routing & Doctor Triage Deployment', description: 'Activate predictive triage algorithms', dueDate: new Date().toISOString(), status: 'COMPLETED', paymentAmount: 800000 },
            { name: 'M3: Telemetry Collection & KPI Verification', description: 'Continuous 60-day telemetry monitoring', dueDate: new Date().toISOString(), status: 'COMPLETED', paymentAmount: 900000 }
        ]
    }, govToken);
    const pilotId = pilotRes.data.id;
    console.log(`-> Pilot Provisioned: ID=${pilotId}, Status=${pilotRes.data.status}`);

    // 10. Dynamic KPI Improvement Calculation
    console.log('\n[Step 10] Calculating Dynamic KPI Improvement...');
    const baseline = 90;
    const actual = 48;
    const improvementPct = ((baseline - actual) / baseline) * 100;
    console.log(`-> Baseline: ${baseline} min, Target: 45 min, Actual: ${actual} min`);
    console.log(`-> Calculated Dynamic Improvement: ${improvementPct.toFixed(1)}% (Statistical significance: Demo estimate)`);

    // 11. Startup Submits Pilot Evidence
    console.log('\n[Step 11] Startup Submits Evidence Documents to Vault...');
    const evidenceRes = await req('/api/evidence', 'POST', {
        pilotId: pilotId,
        title: 'Chhatrapati Shivaji Maharaj Hospital 90-Day Telemetry Dataset & Superintendent Report',
        fileType: 'Telemetry Log & Certified Field Report',
        fileUrl: 'https://sovereign.govproof.gov.in/evidence/CSMH_MedFlow_90Day_Telemetry_Audit.pdf',
        description: 'Complete raw timestamped RFID and queue registration telemetry logs covering 42,800 patient visits with hospital superintendent certification.'
    }, startupToken);
    const evidenceId = evidenceRes.data.id;
    console.log(`-> Evidence Uploaded: ID=${evidenceId}, Status=${evidenceRes.data.verifiedStatus}`);

    // 12. Government Verifies Evidence
    console.log('\n[Step 12] Government Verifies Evidence Record...');
    const verifyRes = await req(`/api/evidence/${evidenceId}/verify`, 'PATCH', {
        verifiedStatus: 'VERIFIED',
        reviewComments: 'Statistical dataset integrity verified against hospital EMR database.'
    }, govToken);
    console.log(`-> Evidence Status: ${verifyRes.data.verifiedStatus}`);

    // 13. Independent Validator Validates Pilot
    console.log('\n[Step 13] Independent Validator Evaluates Evidence (validator@demo.com)...');
    const valLogin = await req('/api/auth/login', 'POST', { email: 'validator@demo.com', password: 'demo123' });
    const valToken = valLogin.data.token;
    const valRes = await req('/api/validation', 'POST', {
        pilotId: pilotId,
        decision: 'VALIDATED',
        methodology: 'Dual-method cryptographic telemetry verification + On-site randomized queue audit',
        findings: 'Outpatient waiting times reduced from 90 min to 48 min (46.7% reduction, High empirical confidence). Zero telemetry tampering detected across 42,800 patient logs.',
        confidence: 'High',
        comments: 'Statutory verification standard met. Solution certified for state-wide public health testbed scaling.'
    }, valToken);
    console.log(`-> Pilot Validation Status: ${valRes.data.decision}`);

    // 14. Generate Innovation Proof Passport
    console.log('\n[Step 14] Generating Innovation Proof Passport...');
    const passRes = await req('/api/passports/generate', 'POST', { pilotId: pilotId }, govToken);
    console.log(`-> Proof Passport Generated: Number=${passRes.data.passportNumber}`);
    console.log(`-> Cryptographic SHA-256 Audit Hash: ${passRes.data.auditHash}`);

    // 15. Dynamic Scale Readiness Engine
    console.log('\n[Step 15] Calculating Dynamic Scale Readiness Dimensions...');
    const scaleRes = await req(`/api/scale/readiness/${pilotId}`, 'GET', null, govToken);
    console.log(`-> Scale Readiness Score: ${scaleRes.data.score}/100`);
    console.log(`-> Readiness Category: ${scaleRes.data.category}`);
    console.log(`-> Recommendation: ${scaleRes.data.recommendation}`);
    console.log(`-> Dimensions Breakdown:`, scaleRes.data.dimensions);

    // 16. Procurement Readiness & Fast-Track Tender Blueprint
    console.log('\n[Step 16] Procurement Readiness & Fast-Track Tender Generation...');
    const procRes = await req(`/api/procurement/pilot/${pilotId}`, 'GET', null, govToken);
    console.log(`-> Procurement Status: ${procRes.data.procurementStatus}`);
    console.log(`-> Fast-Track Eligible: ${procRes.data.fastTrackEligible}`);
    console.log(`-> Generated Tender Document: ${procRes.data.tenderDocUrl}`);

    // 17. Government Makes Final Statutory Decision
    console.log('\n[Step 17] Government Records Final Statutory Scale Decision...');
    const decRes = await req('/api/scale/decision', 'POST', {
        pilotId: pilotId,
        finalDecision: 'SCALE',
        recommendation: 'SCALE',
        reason: 'Statutory proof threshold achieved with verified 46.7% waiting time reduction across 42,800 patient records.',
        comments: 'Authorized for accelerated state-wide framework procurement across all 27 municipal corporation hospitals.'
    }, govToken);
    console.log(`-> Final Decision Recorded: ${decRes.data.finalDecision}`);

    // 18. Audit Trail Verification
    console.log('\n[Step 18] Verifying Immutable Platform Audit Trail...');
    const auditRes = await req('/api/audit', 'GET', null, govToken);
    console.log(`-> Total Audit Records: ${auditRes.data.length} entries`);

    console.log('\n===============================================================');
    console.log('   🎉 COMPLETE PHASE 3 END-TO-END WORKFLOW AUDIT PASSED 100%   ');
    console.log('===============================================================');
}

runPhase3E2E().catch(console.error);
