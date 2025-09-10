// Debug authentication flow
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function testAuth() {
    console.log('🔍 Testing Authentication Flow...');
    
    // Test 1: Try login with test credentials
    try {
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginResponse.status, loginData);
    } catch (error) {
        console.error('Login Error:', error);
    }
    
    // Test 2: Try to access health endpoint
    try {
        const healthResponse = await fetch(`${API_BASE}/api/health`);
        const healthData = await healthResponse.json();
        console.log('Health Check:', healthResponse.status, healthData);
    } catch (error) {
        console.error('Health Error:', error);
    }
    
    // Test 3: Check if there's a different auth endpoint
    try {
        const response = await fetch(`${API_BASE}/api/auth/status`);
        const data = await response.json();
        console.log('Auth Status:', response.status, data);
    } catch (error) {
        console.error('Auth Status Error:', error);
    }
}

testAuth();