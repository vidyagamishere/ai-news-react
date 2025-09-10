// Test the backend fix
const API_BASE = 'https://ai-news-scraper-anmtr1w44.vercel.app';

async function testBackendFix() {
    console.log('🔧 Testing backend fix...');
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    console.log('1️⃣ Testing login with fixed backend...');
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL! Backend fix worked!');
            console.log('🎉 User can now login normally');
            console.log('User:', data.user);
            console.log('Token:', data.token);
            return true;
        } else {
            console.log('❌ Login still failing:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Request error:', error);
    }
    
    // Test 2: Also test with the older API base to see the difference
    console.log('\n2️⃣ Testing with older API for comparison...');
    try {
        const response = await fetch('https://ai-news-scraper-ln76nqcdr.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        console.log('Old API response:', response.status, data.message);
        
    } catch (error) {
        console.error('❌ Old API error:', error);
    }
    
    return false;
}

testBackendFix();