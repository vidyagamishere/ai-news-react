// Test verified user login with different approaches
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function testVerifiedUser() {
    console.log('🔍 Testing verified user login...');
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    // Test 1: Standard login attempt
    console.log('\n1️⃣ Testing standard login...');
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        console.log('Response:', response.status, data);
        
        if (response.ok) {
            console.log('✅ Login successful!');
            return data.token;
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Request error:', error);
    }
    
    // Test 2: Try with different password formats
    console.log('\n2️⃣ Testing password variations...');
    const passwordVariations = [
        'Arunmugam1!',           // Original
        'arunmugam1!',           // Lowercase
        'ARUNMUGAM1!',           // Uppercase
        'Arunmugam1',            // Without special char
    ];
    
    for (const pwd of passwordVariations) {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...credentials, password: pwd })
            });
            
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ SUCCESS with password: ${pwd}`);
                return data.token;
            } else {
                console.log(`❌ Failed with password: ${pwd} - ${data.message}`);
            }
        } catch (error) {
            console.log(`❌ Error with password: ${pwd} - ${error.message}`);
        }
    }
    
    // Test 3: Check if account is actually activated
    console.log('\n3️⃣ Testing account activation status...');
    try {
        // Try to send another OTP to see account status
        const otpResponse = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email })
        });
        
        const otpData = await otpResponse.json();
        console.log('OTP Status:', otpResponse.status, otpData);
        
        if (otpData.message && otpData.message.includes('already verified')) {
            console.log('✅ Account is verified');
        } else if (otpData.message && otpData.message.includes('OTP sent')) {
            console.log('⚠️  Account might still need verification');
        }
        
    } catch (error) {
        console.error('❌ OTP check failed:', error);
    }
    
    // Test 4: Check if there's a different login endpoint
    console.log('\n4️⃣ Testing alternative endpoints...');
    const endpoints = ['/api/auth/signin', '/api/login', '/auth/login'];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (response.status !== 404) {
                const data = await response.json();
                console.log(`${endpoint}:`, response.status, data);
            }
        } catch (error) {
            // Ignore 404s
        }
    }
    
    console.log('\n💡 Next steps:');
    console.log('- Check if password was set correctly during OTP verification');
    console.log('- Verify account activation in backend database');
    console.log('- Try password reset flow');
    console.log('- Check backend logs for authentication errors');
}

testVerifiedUser();