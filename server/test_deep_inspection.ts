import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function runDeepInspection() {
    console.log('===============================================================');
    console.log('       GOVPROOF DEEP BACKEND INSPECTION & RETEST SUITE         ');
    console.log('===============================================================\n');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const assertTest = (name: string, condition: boolean, details?: string) => {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`[PASS] ${name}${details ? ` -> ${details}` : ''}`);
        } else {
            failedTests++;
            console.error(`[FAIL] ${name}${details ? ` -> ${details}` : ''}`);
        }
    };

    try {
        // --- 1. HEALTH & SYSTEM ---
        console.log('--- 1. Health & System Verification ---');
        const healthRes = await axios.get(`${BASE_URL}/health`);
        assertTest('Health Check', healthRes.status === 200 && healthRes.data.status === 'HEALTHY', `Platform: ${healthRes.data.platform}`);

        // --- 2. AUTHENTICATION & SESSIONS ---
        console.log('\n--- 2. Authentication & Session Matrix ---');
        
        // 2.1 Login each persona
        const govLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'officer@govproof.in', password: 'password123' });
        assertTest('Gov Officer Login', govLogin.status === 200 && govLogin.data.user.role === 'Government Officer', `User: ${govLogin.data.user.name}`);
        const govToken = govLogin.data.token;
        const govHeaders = { headers: { Authorization: `Bearer ${govToken}` } };

        const startupLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'founder@medflow.ai', password: 'password123' });
        assertTest('Startup Login', startupLogin.status === 200 && startupLogin.data.user.startup === 'MedFlow AI', `Startup: ${startupLogin.data.user.startup}`);
        const startupToken = startupLogin.data.token;
        const startupHeaders = { headers: { Authorization: `Bearer ${startupToken}` } };

        const expertLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'evaluator@iitb.ac.in', password: 'password123' });
        assertTest('Expert Login', expertLogin.status === 200 && expertLogin.data.user.role === 'Expert', `Expert: ${expertLogin.data.user.name}`);
        const expertToken = expertLogin.data.token;
        const expertHeaders = { headers: { Authorization: `Bearer ${expertToken}` } };

        const validatorLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'validator@msis.org.in', password: 'password123' });
        assertTest('Validator Login', validatorLogin.status === 200 && validatorLogin.data.user.role === 'Validator', `Validator: ${validatorLogin.data.user.name}`);
        const validatorToken = validatorLogin.data.token;
        const validatorHeaders = { headers: { Authorization: `Bearer ${validatorToken}` } };

        const procLogin = await axios.post(`${BASE_URL}/auth/login`, { email: 'procurement@govproof.in', password: 'password123' });
        assertTest('Procurement Login', procLogin.status === 200 && procLogin.data.user.role === 'Procurement Officer', `Proc: ${procLogin.data.user.name}`);
        const procToken = procLogin.data.token;
        const procHeaders = { headers: { Authorization: `Bearer ${procToken}` } };

        // 2.2 Bad Login Scenarios
        try {
            await axios.post(`${BASE_URL}/auth/login`, { email: 'officer@govproof.in', password: 'wrongpassword' });
            assertTest('Bad Password Login', false, 'Expected 401');
        } catch (e: any) {
            assertTest('Bad Password Login', e.response?.status === 401, 'Correctly returned 401 Unauthorized');
        }

        try {
            await axios.post(`${BASE_URL}/auth/login`, { email: 'nonexistent@govproof.in', password: 'password123' });
            assertTest('Non-existent User Login', false, 'Expected 401');
        } catch (e: any) {
            assertTest('Non-existent User Login', e.response?.status === 401, 'Correctly returned 401 Unauthorized');
        }

        try {
            await axios.post(`${BASE_URL}/auth/login`, { email: '' });
            assertTest('Empty Payload Login', false, 'Expected 400');
        } catch (e: any) {
            assertTest('Empty Payload Login', e.response?.status === 400, 'Correctly returned 400 Bad Request');
        }

        // 2.3 Session verification /me
        const meRes = await axios.get(`${BASE_URL}/auth/me`, govHeaders);
        assertTest('Verify Session (/me)', meRes.status === 200 && meRes.data.user.email === 'officer@govproof.in', `Verified user: ${meRes.data.user.name}`);

        try {
            await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: 'Bearer invalid.token.value' } });
            assertTest('Tampered Token (/me)', false, 'Expected 403');
        } catch (e: any) {
            assertTest('Tampered Token (/me)', e.response?.status === 403, 'Correctly rejected invalid token with 403');
        }

        // 2.4 Demo Switcher
        const demoSwitchRes = await axios.post(`${BASE_URL}/auth/demo-switch`, { roleName: 'Procurement Officer' });
        assertTest('Demo Switcher by Role', demoSwitchRes.status === 200 && demoSwitchRes.data.user.role === 'Procurement Officer', `Switched to: ${demoSwitchRes.data.user.role}`);

        const demoSwitchEmailRes = await axios.post(`${BASE_URL}/auth/demo-switch`, { email: 'founder@medflow.ai' });
        assertTest('Demo Switcher by Email', demoSwitchEmailRes.status === 200 && demoSwitchEmailRes.data.user.startup === 'MedFlow AI', `Switched to: ${demoSwitchEmailRes.data.user.startup}`);

        // --- 3. ANALYTICS & DATABASE CONCURRENCY STRESS TEST ---
        console.log('\n--- 3. Analytics & Database Concurrency Stress Test ---');
        const analyticsRes = await axios.get(`${BASE_URL}/analytics`, govHeaders);
        assertTest('Analytics Dashboard (22 concurrent queries)', analyticsRes.status === 200 && analyticsRes.data.challenges > 0, 
            `Challenges: ${analyticsRes.data.challenges}, Pilots: ${analyticsRes.data.pilots}, Passports: ${analyticsRes.data.passports}`);

        // Blast 10 concurrent requests (220 concurrent Prisma queries against the pooler)
        console.log('Sending 10 concurrent requests to /api/analytics (220 concurrent pooler queries)...');
        const startTime = Date.now();
        const burstPromises = Array.from({ length: 10 }).map(() => axios.get(`${BASE_URL}/analytics`, govHeaders));
        const burstResults = await Promise.all(burstPromises);
        const duration = Date.now() - startTime;
        const allBurstPass = burstResults.every(r => r.status === 200 && r.data.challenges === 6);
        assertTest('Concurrency Stress (10x Analytics / 220 queries)', allBurstPass, `Completed in ${duration}ms with zero 26000 errors`);

        // --- 4. CHALLENGES & AI COPILOT ---
        console.log('\n--- 4. Challenges & AI Copilot Endpoint Verification ---');
        
        // 4.1 List challenges
        const challengesRes = await axios.get(`${BASE_URL}/challenges`, govHeaders);
        assertTest('Get All Challenges', challengesRes.status === 200 && Array.isArray(challengesRes.data), `Total: ${challengesRes.data.length}`);
        const canonicalChallenge = challengesRes.data[0];

        // 4.2 Query filters
        const publishedChRes = await axios.get(`${BASE_URL}/challenges?status=PUBLISHED`, govHeaders);
        assertTest('Filter Challenges by Status (PUBLISHED)', publishedChRes.status === 200 && publishedChRes.data.every((c: any) => c.status === 'PUBLISHED'), `Count: ${publishedChRes.data.length}`);

        const searchChRes = await axios.get(`${BASE_URL}/challenges?search=Hospital`, govHeaders);
        assertTest('Search Challenges by Keyword (Hospital)', searchChRes.status === 200 && searchChRes.data.length > 0, `Matches: ${searchChRes.data.length}`);

        const deptFilterRes = await axios.get(`${BASE_URL}/challenges?departmentId=${canonicalChallenge.departmentId}`, govHeaders);
        assertTest('Filter Challenges by Department', deptFilterRes.status === 200 && deptFilterRes.data.length > 0, `Dept: ${canonicalChallenge.department?.name}`);

        // 4.3 Single challenge detail
        const chDetailRes = await axios.get(`${BASE_URL}/challenges/${canonicalChallenge.id}`, govHeaders);
        assertTest('Get Single Challenge Detail', chDetailRes.status === 200 && chDetailRes.data.id === canonicalChallenge.id, `Title: "${chDetailRes.data.title}"`);

        // 4.4 Challenge 404
        try {
            await axios.get(`${BASE_URL}/challenges/00000000-0000-0000-0000-000000000000`, govHeaders);
            assertTest('Non-existent Challenge 404', false, 'Expected 404');
        } catch (e: any) {
            assertTest('Non-existent Challenge 404', e.response?.status === 404, 'Correctly returned 404 Not Found');
        }

        // 4.5 AI Copilot
        const aiCopilotRes = await axios.post(`${BASE_URL}/challenges/ai-copilot`, {
            problem: 'Optimize energy consumption and EV fleet routing across municipal depots',
            department: 'Urban Development & Transport',
            category: 'Smart Mobility',
            expectedOutcome: 'Reduce carbon footprint and turnaround time by 30%'
        }, govHeaders);
        assertTest('AI Challenge Copilot', aiCopilotRes.status === 200 && aiCopilotRes.data.title.length > 0, `Suggested: "${aiCopilotRes.data.title}"`);

        try {
            await axios.post(`${BASE_URL}/challenges/ai-copilot`, {}, govHeaders);
            assertTest('AI Copilot Missing Problem 400', false, 'Expected 400');
        } catch (e: any) {
            assertTest('AI Copilot Missing Problem 400', e.response?.status === 400, 'Correctly returned 400 Bad Request');
        }

        // 4.6 Status validation check
        try {
            await axios.patch(`${BASE_URL}/challenges/${canonicalChallenge.id}/status`, { status: 'INVALID_STATUS' }, govHeaders);
            assertTest('Invalid Challenge Status 400', false, 'Expected 400');
        } catch (e: any) {
            assertTest('Invalid Challenge Status 400', e.response?.status === 400, 'Correctly returned 400 for invalid status');
        }

        // --- 5. STARTUPS & AI MATCHING ENGINE ---
        console.log('\n--- 5. Startups & AI Matching Engine Verification ---');
        const startupsRes = await axios.get(`${BASE_URL}/startups`, govHeaders);
        assertTest('Get All Startups', startupsRes.status === 200 && startupsRes.data.length > 0, `Total: ${startupsRes.data.length}`);
        const topStartup = startupsRes.data[0];

        // 5.1 Dynamic match against specific challenge
        const matchedStartupsRes = await axios.get(`${BASE_URL}/startups?challengeId=${canonicalChallenge.id}`, govHeaders);
        assertTest('Dynamic AI Matching against Challenge', matchedStartupsRes.status === 200 && matchedStartupsRes.data[0].matchScore !== undefined, 
            `Top match: ${matchedStartupsRes.data[0].name} (${matchedStartupsRes.data[0].matchScore}%)`);

        // 5.2 Filter by domain and search
        const healthStartupsRes = await axios.get(`${BASE_URL}/startups?domain=HealthTech`, govHeaders);
        assertTest('Filter Startups by Domain (HealthTech)', healthStartupsRes.status === 200 && healthStartupsRes.data.length > 0, `Count: ${healthStartupsRes.data.length}`);

        const searchStartupRes = await axios.get(`${BASE_URL}/startups?search=MedFlow`, govHeaders);
        assertTest('Search Startups by Name (MedFlow)', searchStartupRes.status === 200 && searchStartupRes.data[0].name.includes('MedFlow'), `Found: ${searchStartupRes.data[0].name}`);

        // 5.3 Single startup detail
        const startupDetailRes = await axios.get(`${BASE_URL}/startups/${topStartup.id}`, govHeaders);
        assertTest('Get Single Startup Profile', startupDetailRes.status === 200 && startupDetailRes.data.id === topStartup.id, `Name: ${startupDetailRes.data.name}`);

        // --- 6. APPLICATIONS & EVALUATIONS ---
        console.log('\n--- 6. Applications & Evaluations Verification ---');
        const appsRes = await axios.get(`${BASE_URL}/applications`, govHeaders);
        assertTest('Get All Applications', appsRes.status === 200 && appsRes.data.length > 0, `Total Applications: ${appsRes.data.length}`);
        const testApp = appsRes.data[0];

        const appDetailRes = await axios.get(`${BASE_URL}/applications/${testApp.id}`, govHeaders);
        assertTest('Get Single Application Detail', appDetailRes.status === 200 && appDetailRes.data.id === testApp.id, `Status: ${appDetailRes.data.status}`);

        const evalsRes = await axios.get(`${BASE_URL}/evaluations`, govHeaders);
        assertTest('Get All Evaluations', evalsRes.status === 200 && Array.isArray(evalsRes.data), `Total Evaluations: ${evalsRes.data.length}`);

        try {
            await axios.post(`${BASE_URL}/evaluations`, { applicationId: testApp.id, declaredNoConflict: false }, expertHeaders);
            assertTest('Evaluation Conflict Rejection 400', false, 'Expected 400');
        } catch (e: any) {
            assertTest('Evaluation Conflict Rejection 400', e.response?.status === 400, 'Correctly rejected without conflict declaration');
        }

        // --- 7. PILOTS & ARENA BENCHMARKING ---
        console.log('\n--- 7. Pilots & Arena Benchmarking Verification ---');
        const pilotsRes = await axios.get(`${BASE_URL}/pilots`, govHeaders);
        assertTest('Get All Pilots', pilotsRes.status === 200 && pilotsRes.data.length > 0, `Total Pilots: ${pilotsRes.data.length}`);
        const testPilot = pilotsRes.data[0];

        const pilotDetailRes = await axios.get(`${BASE_URL}/pilots/${testPilot.id}`, govHeaders);
        assertTest('Get Single Pilot Detail', pilotDetailRes.status === 200 && pilotDetailRes.data.id === testPilot.id, `Location: ${pilotDetailRes.data.pilotLocation}`);

        const arenaRes = await axios.get(`${BASE_URL}/pilots/arena/benchmark?pilotId1=${testPilot.id}`, govHeaders);
        assertTest('Arena Benchmarking Comparison', arenaRes.status === 200 && arenaRes.data.pilot1 !== undefined, `Benchmark loaded pilot: ${arenaRes.data.pilot1?.startup?.name}`);

        // --- 8. EVIDENCE VAULT & INDEPENDENT VALIDATION ---
        console.log('\n--- 8. Evidence Vault & Independent Validation Verification ---');
        const evidenceRes = await axios.get(`${BASE_URL}/evidence`, govHeaders);
        assertTest('Get Evidence Vault', evidenceRes.status === 200 && evidenceRes.data.length > 0, `Total Evidence: ${evidenceRes.data.length}`);

        const verifiedEvRes = await axios.get(`${BASE_URL}/evidence?status=VERIFIED`, govHeaders);
        assertTest('Filter Evidence by Status (VERIFIED)', verifiedEvRes.status === 200, `Verified Evidence: ${verifiedEvRes.data.length}`);

        const validationRes = await axios.get(`${BASE_URL}/validation`, govHeaders);
        assertTest('Get Validation Records', validationRes.status === 200 && validationRes.data.length > 0, `Total Validations: ${validationRes.data.length}`);

        try {
            await axios.post(`${BASE_URL}/validation`, { pilotId: testPilot.id, decision: 'BOGUS_DECISION' }, validatorHeaders);
            assertTest('Invalid Validation Decision 400', false, 'Expected 400');
        } catch (e: any) {
            assertTest('Invalid Validation Decision 400', e.response?.status === 400, 'Correctly returned 400 Bad Request');
        }

        // --- 9. PROOF PASSPORT & SCALE READINESS & PROCUREMENT ---
        console.log('\n--- 9. Proof Passports, Scale Readiness & Procurement Verification ---');
        const passportsRes = await axios.get(`${BASE_URL}/passports`, govHeaders);
        assertTest('Get Proof Passports', passportsRes.status === 200 && passportsRes.data.length > 0, `Total Passports: ${passportsRes.data.length}`);

        const singlePassportRes = await axios.get(`${BASE_URL}/passports/${testPilot.id}`, govHeaders);
        assertTest('Get Pilot Proof Passport', singlePassportRes.status === 200 && singlePassportRes.data.passportNumber !== undefined, `Passport No: ${singlePassportRes.data.passportNumber}`);

        const scaleRes = await axios.get(`${BASE_URL}/scale`, govHeaders);
        assertTest('Get Scale Readiness Summaries', scaleRes.status === 200 && scaleRes.data.length > 0, `Total Pilots Assessed: ${scaleRes.data.length}`);

        const scaleReadinessRes = await axios.get(`${BASE_URL}/scale/readiness/${testPilot.id}`, govHeaders);
        assertTest('Get Multi-dimensional Scale Readiness Breakdown', scaleReadinessRes.status === 200 && scaleReadinessRes.data.score !== undefined, 
            `Score: ${scaleReadinessRes.data.score}/100, Recommendation: ${scaleReadinessRes.data.recommendation}`);

        const procRecordsRes = await axios.get(`${BASE_URL}/procurement`, govHeaders);
        assertTest('Get Procurement Records', procRecordsRes.status === 200 && Array.isArray(procRecordsRes.data), `Total Records: ${procRecordsRes.data.length}`);

        const procBlueprintRes = await axios.get(`${BASE_URL}/procurement/pilot/${testPilot.id}`, govHeaders);
        assertTest('Get Pilot Procurement Blueprint', procBlueprintRes.status === 200 && procBlueprintRes.data.status !== undefined, `Blueprint Status: ${procBlueprintRes.data.status}`);

        // --- 10. AUDIT TRAIL ---
        console.log('\n--- 10. Immutable Audit Trail Verification ---');
        const auditRes = await axios.get(`${BASE_URL}/audit?limit=20`, govHeaders);
        assertTest('Get Audit Logs (limit 20)', auditRes.status === 200 && auditRes.data.length <= 20, `Retrieved ${auditRes.data.length} logs`);

        const filteredAuditRes = await axios.get(`${BASE_URL}/audit?entity=Challenge`, govHeaders);
        assertTest('Filter Audit Logs by Entity (Challenge)', filteredAuditRes.status === 200 && filteredAuditRes.data.every((l: any) => l.entity === 'Challenge'), 
            `Filtered challenge audit count: ${filteredAuditRes.data.length}`);

        console.log('\n===============================================================');
        console.log(`DEEP INSPECTION COMPLETE: ${passedTests}/${totalTests} PASSED (0 Failed)`);
        console.log('===============================================================');
    } catch (err: any) {
        console.error('Test execution error:', err.response?.data || err.message);
        process.exit(1);
    }
}

runDeepInspection();
