// Test with real user credentials
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function testRealUser() {
    console.log('🔍 Testing with real user credentials...');
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    console.log('Sending payload:', JSON.stringify(credentials, null, 2));
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('Token:', data.token);
            console.log('User:', data.user);
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Request error:', error);
    }
}

testRealUser();