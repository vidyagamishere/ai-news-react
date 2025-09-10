// Test deployed applications
async function testDeployedApps() {
    console.log('🚀 Testing deployed applications...');
    
    const BACKEND_URL = 'https://ai-news-scraper-anmtr1w44.vercel.app';
    const FRONTEND_URL = 'https://ai-news-react-ggkpfciu7-vijayan-subramaniyans-projects-0c70c64d.vercel.app';
    
    console.log('Backend URL:', BACKEND_URL);
    console.log('Frontend URL:', FRONTEND_URL);
    
    // Test 1: Backend health check
    console.log('\n1️⃣ Testing backend health...');
    try {
        const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Backend health:', healthData.status);
        console.log('   Components:', Object.entries(healthData.components).map(([k,v]) => `${k}: ${v}`).join(', '));
    } catch (error) {
        console.error('❌ Backend health check failed:', error.message);
    }
    
    // Test 2: Authentication flow
    console.log('\n2️⃣ Testing authentication...');
    try {
        const credentials = {
            email: 'dhanyashreevijayan@gmail.com',
            password: 'Arunmugam1!'
        };
        
        const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.user && loginData.token) {
            console.log('✅ Login successful!');
            console.log('   User:', loginData.user.name, `(${loginData.user.email})`);
            console.log('   Token length:', loginData.token.length);
            
            // Test profile access
            const profileResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (profileResponse.ok) {
                console.log('✅ Profile access successful!');
            } else {
                console.log('❌ Profile access failed');
            }
            
        } else {
            console.log('❌ Login failed:', loginData.message);
        }
        
    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
    }
    
    // Test 3: Frontend accessibility
    console.log('\n3️⃣ Testing frontend accessibility...');
    try {
        const frontendResponse = await fetch(FRONTEND_URL);
        if (frontendResponse.ok) {
            console.log('✅ Frontend accessible:', frontendResponse.status);
            console.log('   Content-Type:', frontendResponse.headers.get('content-type'));
        } else {
            console.log('❌ Frontend not accessible:', frontendResponse.status);
        }
    } catch (error) {
        console.error('❌ Frontend test failed:', error.message);
    }
    
    // Test 4: API integration
    console.log('\n4️⃣ Testing API integration...');
    try {
        const digestResponse = await fetch(`${BACKEND_URL}/api/digest`);
        const digestData = await digestResponse.json();
        
        if (digestResponse.ok && digestData.summary) {
            console.log('✅ API integration working');
            console.log('   Top stories count:', digestData.topStories?.length || 0);
            console.log('   Content sections:', Object.keys(digestData.content || {}));
        } else {
            console.log('❌ API integration failed');
        }
    } catch (error) {
        console.error('❌ API integration test failed:', error.message);
    }
    
    console.log('\n🎉 Deployment testing complete!');
    console.log('\n📋 Deployment URLs:');
    console.log('🔧 Backend API:', BACKEND_URL);
    console.log('🌐 Frontend App:', FRONTEND_URL);
    console.log('\n👤 Test Credentials:');
    console.log('   Email: dhanyashreevijayan@gmail.com');
    console.log('   Password: Arunmugam1!');
    
}

testDeployedApps();