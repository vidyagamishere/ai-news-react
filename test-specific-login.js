// Test the specific login case that was failing
const API_BASE = 'https://ai-news-scraper-anmtr1w44.vercel.app';

async function testSpecificLogin() {
    console.log('🎯 Testing the specific login case that was failing...');
    console.log('Email: dhanyashreevijayan@gmail.com');
    console.log('Password: Arunmugam1!');
    console.log('Backend:', API_BASE);
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    try {
        console.log('\n📤 Sending login request...');
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        console.log('📥 Response received:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📋 Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.user && data.token) {
            console.log('\n🎉 SUCCESS! Login is working!');
            console.log('✅ User authenticated:', data.user.name, '(' + data.user.email + ')');
            console.log('✅ Token received:', data.token.substring(0, 40) + '...');
            console.log('✅ Subscription tier:', data.user.subscriptionTier);
            console.log('✅ Email verified:', data.user.emailVerified);
            
            // Test profile access with token
            console.log('\n🔐 Testing profile access with token...');
            const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const profileData = await profileResponse.json();
            console.log('📋 Profile data:', JSON.stringify(profileData, null, 2));
            
            if (profileResponse.ok) {
                console.log('✅ Profile access successful! Authentication is fully working!');
            } else {
                console.log('❌ Profile access failed:', profileData.message);
            }
            
            return true;
        } else {
            console.log('\n❌ Login failed:');
            console.log('Message:', data.message);
            console.log('Error:', data.error);
            return false;
        }
        
    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
        return false;
    }
}

testSpecificLogin();