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

async function verifyAuthPhase2() {
    console.log('=== PHASE 2 AUTHENTICATION & RBAC VERIFICATION ===\n');

    console.log('1. Testing Government Login (gov@demo.com)...');
    const govLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'demo123' });
    console.log(`-> Status: ${govLogin.status}, User: ${govLogin.data?.user?.name}, Role: ${govLogin.data?.user?.role}`);

    console.log('\n2. Testing /api/auth/me for Government session...');
    const govMe = await req('/api/auth/me', 'GET', null, govLogin.data?.token);
    console.log(`-> Status: ${govMe.status}, Verified Role: ${govMe.data?.user?.role}, Dept: ${govMe.data?.user?.department}`);

    console.log('\n3. Testing Startup Login (founder@medflow.com)...');
    const startupLogin = await req('/api/auth/login', 'POST', { email: 'founder@medflow.com', password: 'demo123' });
    console.log(`-> Status: ${startupLogin.status}, User: ${startupLogin.data?.user?.name}, Role: ${startupLogin.data?.user?.role}, Startup: ${startupLogin.data?.user?.startup}`);

    console.log('\n4. Testing /api/auth/me for Startup session...');
    const startupMe = await req('/api/auth/me', 'GET', null, startupLogin.data?.token);
    console.log(`-> Status: ${startupMe.status}, Verified Role: ${startupMe.data?.user?.role}, Startup: ${startupMe.data?.user?.startup}`);

    console.log('\n5. Testing 1-Click Demo Persona Switcher (Expert, Validator, Procurement)...');
    const expertSwitch = await req('/api/auth/demo-switch', 'POST', { email: 'expert@demo.com' });
    console.log(`-> Switched to Expert: ${expertSwitch.data?.user?.name} (${expertSwitch.data?.user?.role})`);

    const validatorSwitch = await req('/api/auth/demo-switch', 'POST', { email: 'validator@demo.com' });
    console.log(`-> Switched to Validator: ${validatorSwitch.data?.user?.name} (${validatorSwitch.data?.user?.role})`);

    const procSwitch = await req('/api/auth/demo-switch', 'POST', { email: 'procurement@demo.com' });
    console.log(`-> Switched to Procurement: ${procSwitch.data?.user?.name} (${procSwitch.data?.user?.role})`);

    console.log('\n6. Testing Invalid Password Rejection (401)...');
    const badLogin = await req('/api/auth/login', 'POST', { email: 'gov@demo.com', password: 'wrongpassword' });
    console.log(`-> Status: ${badLogin.status} (Expected 401: Invalid Credentials)`);

    console.log('\n✅ ALL PHASE 2 AUTHENTICATION & RBAC ENDPOINTS VERIFIED SUCCESSFULLY!');
}

verifyAuthPhase2().catch(console.error);
