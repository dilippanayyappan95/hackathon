import http from 'http';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

interface ReqResponse {
    status: number;
    data: any;
}

function req(path: string, method: string = 'GET', body: any = null, token: string | null = null): Promise<ReqResponse> {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (payload) headers['Content-Length'] = Buffer.byteLength(payload).toString();
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
                    resolve({ status: res.statusCode || 500, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode || 500, data });
                }
            });
        });
        r.on('error', reject);
        if (payload) r.write(payload);
        r.end();
    });
}

interface TestResult {
    category: string;
    name: string;
    endpoint: string;
    method: string;
    status: number;
    expectedStatus: number;
    passed: boolean;
    notes: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, endpoint: string, method: string, res: ReqResponse, expectedStatus: number, notes: string = '') {
    const passed = res.status === expectedStatus;
    results.push({
        category,
        name,
        endpoint,
        method,
        status: res.status,
        expectedStatus,
        passed,
        notes: notes || (passed ? 'OK' : `Expected ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.data).slice(0, 80)}`)
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] [${category}] ${name} -> ${method} ${endpoint} (${res.status}) ${notes}`);
}

async function runSuite() {
    console.log('===============================================================');
    console.log('       GOVPROOF COMPREHENSIVE BACKEND TEST HARNESS             ');
    console.log('===============================================================\n');

    // 1. Health Endpoint
    const health = await req('/api/health');
    record('System', 'Health Check', '/api/health', 'GET', health, 200, `Platform: ${health.data?.platform}`);

    // 2. Authentication Tests
    console.log('\n--- STEP 2: Authentication Tests ---');
    // 2.1 Login with valid Gov credentials
    const govLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'demo123' });
    record('Auth', 'Gov Officer Login', '/api/auth/login', 'POST', govLogin, 200, `Role: ${govLogin.data?.user?.role}`);
    const govToken = govLogin.data?.token;

    // 2.2 Login with Startup credentials
    const startupLogin = await req('/api/auth/login', 'POST', { email: 'founder@medflow.com', password: 'demo123' });
    record('Auth', 'Startup Login', '/api/auth/login', 'POST', startupLogin, 200, `Startup: ${startupLogin.data?.user?.startup}`);
    const startupToken = startupLogin.data?.token;

    // 2.3 Login with Expert credentials
    const expertLogin = await req('/api/auth/login', 'POST', { email: 'expert@demo.com', password: 'demo123' });
    record('Auth', 'Expert Login', '/api/auth/login', 'POST', expertLogin, 200, `Role: ${expertLogin.data?.user?.role}`);
    const expertToken = expertLogin.data?.token;

    // 2.4 Login with Validator credentials
    const valLogin = await req('/api/auth/login', 'POST', { email: 'validator@demo.com', password: 'demo123' });
    record('Auth', 'Validator Login', '/api/auth/login', 'POST', valLogin, 200, `Role: ${valLogin.data?.user?.role}`);
    const valToken = valLogin.data?.token;

    // 2.5 Login with Procurement credentials
    const procLogin = await req('/api/auth/login', 'POST', { email: 'procurement@demo.com', password: 'demo123' });
    record('Auth', 'Procurement Login', '/api/auth/login', 'POST', procLogin, 200, `Role: ${procLogin.data?.user?.role}`);
    const procToken = procLogin.data?.token;

    // 2.6 Invalid credentials
    const invalidLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'wrongpassword' });
    record('Auth', 'Invalid Password', '/api/auth/login', 'POST', invalidLogin, 401, 'Correctly rejected');

    // 2.7 /api/auth/me with valid token
    const meRes = await req('/api/auth/me', 'GET', null, govToken);
    record('Auth', 'Verify Session (/me)', '/api/auth/me', 'GET', meRes, 200, `User: ${meRes.data?.user?.name}`);

    // 2.8 /api/auth/me without token (401)
    const meNoToken = await req('/api/auth/me', 'GET');
    record('Auth', 'Verify Session without token', '/api/auth/me', 'GET', meNoToken, 401, 'Access denied correctly');

    // 2.9 /api/auth/demo-switch by roleName
    const demoSwitch = await req('/api/auth/demo-switch', 'POST', { roleName: 'Validator' });
    record('Auth', 'Demo Role Switcher', '/api/auth/demo-switch', 'POST', demoSwitch, 200, `Switched to: ${demoSwitch.data?.user?.role}`);

    // 3. RBAC & Authorization Tests
    console.log('\n--- STEP 3: RBAC & Permission Tests ---');
    // 3.1 Unauthenticated requests to protected endpoints -> 401
    const challengesNoToken = await req('/api/challenges', 'GET');
    record('RBAC', 'Challenges without token', '/api/challenges', 'GET', challengesNoToken, 401, 'Blocked 401');

    const analyticsNoToken = await req('/api/analytics', 'GET');
    record('RBAC', 'Analytics without token', '/api/analytics', 'GET', analyticsNoToken, 401, 'Blocked 401');

    // 3.2 Startup attempts to create challenge (requires Gov/Admin) -> 403
    const startupCreateCh = await req('/api/challenges', 'POST', { title: 'Unauthorized Challenge' }, startupToken);
    record('RBAC', 'Startup creating challenge', '/api/challenges', 'POST', startupCreateCh, 403, 'Forbidden 403');

    // 3.3 Startup attempts validation POST (requires Validator/Admin) -> 403
    const startupValidate = await req('/api/validation', 'POST', { pilotId: 'dummy', decision: 'VALIDATED' }, startupToken);
    record('RBAC', 'Startup posting validation', '/api/validation', 'POST', startupValidate, 403, 'Forbidden 403');

    // 3.4 Expert attempts scale decision POST (requires Gov/Admin) -> 403
    const expertScale = await req('/api/scale/decision', 'POST', { pilotId: 'dummy', finalDecision: 'SCALE' }, expertToken);
    record('RBAC', 'Expert posting scale decision', '/api/scale/decision', 'POST', expertScale, 403, 'Forbidden 403');

    // 3.5 Validator submitting evaluation (requires Expert/Admin/Gov) -> 403
    const valEval = await req('/api/evaluations', 'POST', { applicationId: 'dummy', conflict: true }, valToken);
    record('RBAC', 'Validator submitting evaluation', '/api/evaluations', 'POST', valEval, 403, 'Forbidden 403');

    // 4. Data Endpoints & Concurrent Analytics Tests
    console.log('\n--- STEP 4: Core Data Endpoints & Concurrent Database Queries ---');
    // 4.1 Analytics endpoint (executes 22 simultaneous Prisma queries via Promise.all)
    const analytics = await req('/api/analytics', 'GET', null, govToken);
    record('Analytics', 'Dashboard Analytics (22 concurrent queries)', '/api/analytics', 'GET', analytics, 200, `Challenges: ${analytics.data?.challenges}, Pilots: ${analytics.data?.pilots}, VerifiedEvidence: ${analytics.data?.verifiedEvidence}`);

    // 4.2 Concurrent stress test: 5 simultaneous hits to /api/analytics (110 total concurrent queries)
    console.log('Firing 5 concurrent /api/analytics requests (110 concurrent Prisma queries)...');
    const multiAnalytics = await Promise.all(Array.from({ length: 5 }, () => req('/api/analytics', 'GET', null, govToken)));
    const allMultiPass = multiAnalytics.every(r => r.status === 200);
    record('Prisma Pooler', 'Concurrent 5x Analytics (110 queries)', '/api/analytics (5x)', 'GET', { status: allMultiPass ? 200 : 500, data: null }, 200, 'Zero 26000 errors');

    // 4.3 Challenges listing
    const challenges = await req('/api/challenges', 'GET', null, govToken);
    record('Challenges', 'Get Challenges List', '/api/challenges', 'GET', challenges, 200, `Count: ${challenges.data?.length} challenges`);

    const firstChallenge = challenges.data?.[0];
    if (firstChallenge) {
        // 4.4 Challenge Detail
        const chDetail = await req(`/api/challenges/${firstChallenge.id}`, 'GET', null, govToken);
        record('Challenges', 'Get Challenge Detail', `/api/challenges/${firstChallenge.id}`, 'GET', chDetail, 200, `Title: "${chDetail.data?.title}"`);
    }

    // 4.5 AI Challenge Copilot
    const copilot = await req('/api/challenges/ai-copilot', 'POST', {
        problem: 'Excessive patient wait times in public healthcare facilities',
        department: 'Maharashtra Health Innovation Department',
        category: 'Healthcare',
        expectedOutcome: 'Reduce waiting time by 45%'
    }, govToken);
    record('AI Copilot', 'Generate AI Challenge Draft', '/api/challenges/ai-copilot', 'POST', copilot, 200, `Suggested: "${copilot.data?.title}"`);

    // 4.6 Startups & AI Matching
    const startups = await req(`/api/startups?challengeId=${firstChallenge?.id || ''}`, 'GET', null, govToken);
    record('Startups', 'Get Startups with AI Matching', '/api/startups', 'GET', startups, 200, `Found: ${startups.data?.length} startups, Top match: ${startups.data?.[0]?.name} (${startups.data?.[0]?.matchScore}%)`);

    const firstStartup = startups.data?.[0];
    if (firstStartup) {
        const startupDetail = await req(`/api/startups/${firstStartup.id}`, 'GET', null, govToken);
        record('Startups', 'Get Startup Detail', `/api/startups/${firstStartup.id}`, 'GET', startupDetail, 200, `Name: ${startupDetail.data?.name}`);
    }

    // 4.7 Applications listing
    const apps = await req('/api/applications', 'GET', null, govToken);
    record('Applications', 'Get Applications List', '/api/applications', 'GET', apps, 200, `Count: ${apps.data?.length}`);

    const firstApp = apps.data?.[0];
    if (firstApp) {
        const appDetail = await req(`/api/applications/${firstApp.id}`, 'GET', null, govToken);
        record('Applications', 'Get Application Detail', `/api/applications/${firstApp.id}`, 'GET', appDetail, 200, `Status: ${appDetail.data?.status}`);
    }

    // 4.8 Evaluations listing
    const evals = await req('/api/evaluations', 'GET', null, govToken);
    record('Evaluations', 'Get Evaluations List', '/api/evaluations', 'GET', evals, 200, `Count: ${evals.data?.length}`);

    // 4.9 Pilots listing
    const pilots = await req('/api/pilots', 'GET', null, govToken);
    record('Pilots', 'Get Pilots List', '/api/pilots', 'GET', pilots, 200, `Count: ${pilots.data?.length}`);

    const firstPilot = pilots.data?.[0];
    if (firstPilot) {
        const pilotDetail = await req(`/api/pilots/${firstPilot.id}`, 'GET', null, govToken);
        record('Pilots', 'Get Pilot Detail', `/api/pilots/${firstPilot.id}`, 'GET', pilotDetail, 200, `Location: ${pilotDetail.data?.pilotLocation}, KPIs: ${pilotDetail.data?.kpis?.length}`);
    }

    // 4.10 Evidence Vault
    const evidence = await req('/api/evidence', 'GET', null, govToken);
    record('Evidence', 'Get Evidence Vault', '/api/evidence', 'GET', evidence, 200, `Count: ${evidence.data?.length}`);

    // 4.11 Validation Records
    const validations = await req('/api/validation', 'GET', null, govToken);
    record('Validation', 'Get Validation Records', '/api/validation', 'GET', validations, 200, `Count: ${validations.data?.length}`);

    // 4.12 Proof Passports
    const passports = await req('/api/passports', 'GET', null, govToken);
    record('Passports', 'Get Proof Passports', '/api/passports', 'GET', passports, 200, `Count: ${passports.data?.length}`);

    if (firstPilot) {
        const singlePassport = await req(`/api/passports/${firstPilot.id}`, 'GET', null, govToken);
        record('Passports', 'Get Single Pilot Passport', `/api/passports/${firstPilot.id}`, 'GET', singlePassport, 200, `Number: ${singlePassport.data?.passportNumber}`);
    }

    // 4.13 Scale Readiness
    const scale = await req('/api/scale', 'GET', null, govToken);
    record('Scale', 'Get Scale Readiness List', '/api/scale', 'GET', scale, 200, `Count: ${scale.data?.length}`);

    if (firstPilot) {
        const scaleDetail = await req(`/api/scale/readiness/${firstPilot.id}`, 'GET', null, govToken);
        record('Scale', 'Get Scale Readiness Dimensions', `/api/scale/readiness/${firstPilot.id}`, 'GET', scaleDetail, 200, `Score: ${scaleDetail.data?.score}, Category: ${scaleDetail.data?.category}`);
    }

    // 4.14 Procurement Records & Blueprint
    const procurement = await req('/api/procurement', 'GET', null, govToken);
    record('Procurement', 'Get Procurement Records', '/api/procurement', 'GET', procurement, 200, `Count: ${procurement.data?.length}`);

    if (firstPilot) {
        const procBlueprint = await req(`/api/procurement/pilot/${firstPilot.id}`, 'GET', null, govToken);
        record('Procurement', 'Get Procurement Blueprint', `/api/procurement/pilot/${firstPilot.id}`, 'GET', procBlueprint, 200, `Status: ${procBlueprint.data?.procurementStatus}, FastTrack: ${procBlueprint.data?.fastTrackEligible}`);
    }

    // 4.15 Audit Logs
    const audit = await req('/api/audit', 'GET', null, govToken);
    record('Audit', 'Get Audit Trail', '/api/audit', 'GET', audit, 200, `Count: ${audit.data?.length}`);

    console.log('\n===============================================================');
    console.log(`TEST SUITE COMPLETE: ${results.filter(r => r.passed).length}/${results.length} PASSED`);
    console.log('===============================================================');
}

runSuite().catch(console.error);
