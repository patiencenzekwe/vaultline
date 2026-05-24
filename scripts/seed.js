const https = require('https');

async function apiCall(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.vaultline.uk',
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(data && { 'Content-Length': Buffer.byteLength(data) })
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch {
                    resolve(responseData);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function seed() {
    console.log('Seeding Vaultline platform data...\n');

    console.log('Creating James Harrison...');
    const james = await apiCall('POST', '/api/auth/register', {
        email: 'james.harrison@vaultline.com',
        password: 'Vaultline1!',
        full_name: 'James Harrison'
    });

    if (!james.token) {
        console.error('Failed to create James Harrison:', james);
        process.exit(1);
    }
    const jamesToken = james.token;
    console.log('James Harrison created. ID:', james.user.id);

    console.log('Creating Sarah Mitchell...');
    const sarah = await apiCall('POST', '/api/auth/register', {
        email: 'sarah.mitchell@vaultline.com',
        password: 'Vaultline1!',
        full_name: 'Sarah Mitchell'
    });

    if (!sarah.token) {
        console.error('Failed to create Sarah Mitchell:', sarah);
        process.exit(1);
    }
    const sarahToken = sarah.token;
    console.log('Sarah Mitchell created. ID:', sarah.user.id);

    const jamesAccounts = await apiCall('GET', '/api/accounts', null, jamesToken);
    const jamesCurrentAccount = jamesAccounts.accounts[0];
    console.log('\nJames current account:', jamesCurrentAccount.id);
    console.log('James opening balance: £', jamesCurrentAccount.balance);

    const sarahAccounts = await apiCall('GET', '/api/accounts', null, sarahToken);
    const sarahCurrentAccount = sarahAccounts.accounts[0];
    console.log('Sarah current account:', sarahCurrentAccount.id);
    console.log('Sarah opening balance: £', sarahCurrentAccount.balance);

    console.log('\nCreating transfers...');

    await sleep(500);
    const t1 = await apiCall('POST', '/api/transfers', {
        from_account_id: jamesCurrentAccount.id,
        to_account_id: sarahCurrentAccount.id,
        amount: 250,
        description: 'Rent contribution'
    }, jamesToken);
    console.log('Transfer 1 — James to Sarah £250:', t1.reference || t1.error);

    await sleep(500);
    const t2 = await apiCall('POST', '/api/transfers', {
        from_account_id: sarahCurrentAccount.id,
        to_account_id: jamesCurrentAccount.id,
        amount: 85,
        description: 'Groceries split'
    }, sarahToken);
    console.log('Transfer 2 — Sarah to James £85:', t2.reference || t2.error);

    await sleep(500);
    const t3 = await apiCall('POST', '/api/transfers', {
        from_account_id: jamesCurrentAccount.id,
        to_account_id: sarahCurrentAccount.id,
        amount: 500,
        description: 'Holiday fund'
    }, jamesToken);
    console.log('Transfer 3 — James to Sarah £500:', t3.reference || t3.error);

    await sleep(500);
    const t4 = await apiCall('POST', '/api/transfers', {
        from_account_id: sarahCurrentAccount.id,
        to_account_id: jamesCurrentAccount.id,
        amount: 120,
        description: 'Utility bills'
    }, sarahToken);
    console.log('Transfer 4 — Sarah to James £120:', t4.reference || t4.error);

    await sleep(500);
    const t5 = await apiCall('POST', '/api/transfers', {
        from_account_id: jamesCurrentAccount.id,
        to_account_id: sarahCurrentAccount.id,
        amount: 75,
        description: 'Birthday dinner'
    }, jamesToken);
    console.log('Transfer 5 — James to Sarah £75:', t5.reference || t5.error);

    const jamesFinal = await apiCall('GET', '/api/accounts', null, jamesToken);
    const sarahFinal = await apiCall('GET', '/api/accounts', null, sarahToken);

    console.log('\nFinal balances:');
    console.log('James Harrison: £', jamesFinal.accounts[0].balance);
    console.log('Sarah Mitchell: £', sarahFinal.accounts[0].balance);

    console.log('\nVaultline platform data seeded successfully.');
}

seed().catch(console.error);