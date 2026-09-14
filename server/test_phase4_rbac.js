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

async function testPhase4RBAC() {
    console.log('====================================================');
    console.log('   GOVPROOF PHASE 4: STRICT RBAC & SECURITY AUDIT   ');
    console.log('====================================================\n');

    // 1. Unauthenticated requests
    console.log('1. Testing Unauthenticated Access to /api/challenges (POST)...');
    const unauthPost = await req('/api/challenges', 'POST', { title: 'Unauthorized Challenge' });
    console.log(`-> Status: ${unauthPost.status} (Expected 401)`);
    if (unauthPost.status !== 401) throw new Error('Unauthenticated request did not return 401');

    console.log('\n2. Testing Malformed Token Rejection...');
    const badTokenRes = await req('/api/challenges', 'GET', null, 'malformed.token.signature');
    console.log(`-> Status: ${badTokenRes.status} (Expected 401)`);
    if (badTokenRes.status !== 401) throw new Error('Malformed token did not return 401');

    // Login personas
    const govLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'demo123' });
    const startupLogin = await req('/api/auth/login', 'POST', { email: 'founder@medflow.com', password: 'demo123' });
    const expertLogin = await req('/api/auth/login', 'POST', { email: 'expert@demo.com', password: 'demo123' });
    const valLogin = await req('/api/auth/login', 'POST', { email: 'validator@demo.com', password: 'demo123' });
    const procLogin = await req('/api/auth/login', 'POST', { email: 'procurement@demo.com', password: 'demo123' });

    const govToken = govLogin.data.token;
    const startupToken = startupLogin.data.token;
    const expertToken = expertLogin.data.token;
    const valToken = valLogin.data.token;
    const procToken = procLogin.data.token;

    // 3. Startup attempting Government-only actions (Create Challenge)
    console.log('\n3. Testing Startup attempting to create challenge (POST /api/challenges)...');
    const startupCreateCh = await req('/api/challenges', 'POST', {
        title: 'Startup Fake Challenge',
        description: 'Should fail'
    }, startupToken);
    console.log(`-> Status: ${startupCreateCh.status} (Expected 403 Forbidden)`);
    if (startupCreateCh.status !== 403) throw new Error('Startup was able to create challenge');

    // 4. Expert attempting to Provision Pilot (POST /api/pilots)
    console.log('\n4. Testing Expert attempting to provision pilot (POST /api/pilots)...');
    const expertPilot = await req('/api/pilots', 'POST', {
        applicationId: 'test-app-id'
    }, expertToken);
    console.log(`-> Status: ${expertPilot.status} (Expected 403 Forbidden)`);
    if (expertPilot.status !== 403) throw new Error('Expert was able to provision pilot');

    // 5. Validator attempting to Create Evaluation (POST /api/evaluations)
    console.log('\n5. Testing Validator attempting to score application (POST /api/evaluations)...');
    const valEval = await req('/api/evaluations', 'POST', {
        applicationId: 'test-app-id',
        score: 95
    }, valToken);
    console.log(`-> Status: ${valEval.status} (Expected 403 Forbidden)`);
    if (valEval.status !== 403) throw new Error('Validator was able to evaluate application');

    // 6. Startup attempting to Validate Pilot (POST /api/validation)
    console.log('\n6. Testing Startup attempting to independently validate pilot (POST /api/validation)...');
    const startupVal = await req('/api/validation', 'POST', {
        pilotId: 'test-pilot-id',
        decision: 'VALIDATED'
    }, startupToken);
    console.log(`-> Status: ${startupVal.status} (Expected 403 Forbidden)`);
    if (startupVal.status !== 403) throw new Error('Startup was able to perform independent validation');

    // 7. Startup attempting to Generate Passport (POST /api/passports/generate)
    console.log('\n7. Testing Startup attempting to generate proof passport (POST /api/passports/generate)...');
    const startupPass = await req('/api/passports/generate', 'POST', {
        pilotId: 'test-pilot-id'
    }, startupToken);
    console.log(`-> Status: ${startupPass.status} (Expected 403 Forbidden)`);
    if (startupPass.status !== 403) throw new Error('Startup was able to generate passport');

    // 8. Government authorized action succeeds
    console.log('\n8. Testing Government authorized access to /api/auth/me...');
    const govMe = await req('/api/auth/me', 'GET', null, govToken);
    console.log(`-> Status: ${govMe.status}, Verified Role: ${govMe.data?.user?.role}`);
    if (govMe.status !== 200) throw new Error('Government auth failed');

    console.log('\n====================================================');
    console.log('   🎉 ALL PHASE 4 RBAC & SECURITY TESTS PASSED 100%   ');
    console.log('====================================================');
}

testPhase4RBAC().catch((e) => {
    console.error('\n❌ RBAC Test Failed:', e);
    process.exit(1);
});
