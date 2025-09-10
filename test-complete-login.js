// Test complete login flow with frontend auth service
import fetch from 'node-fetch';

// Simulate the frontend AuthService
class TestAuthService {
    constructor() {
        this.API_BASE = 'https://ai-news-scraper-anmtr1w44.vercel.app';
    }

    async request(endpoint, options = {}) {
        const token = null; // No stored token for login test
        
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `Request failed: ${response.status}`);
        }

        return response.json();
    }

    async login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async validateToken(token) {
        return this.request('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
}

async function testCompleteLoginFlow() {
    console.log('🚀 Testing complete login flow...');
    
    const authService = new TestAuthService();
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    try {
        console.log('1️⃣ Testing login...');
        const { user, token } = await authService.login(credentials);
        console.log('✅ Login successful!');
        console.log('User:', user.name, user.email);
        console.log('Token:', token.substring(0, 30) + '...');
        
        console.log('\n2️⃣ Testing token validation...');
        const profile = await authService.validateToken(token);
        console.log('✅ Token validation successful!');
        console.log('Profile:', profile.name, profile.email);
        
        console.log('\n🎉 COMPLETE SUCCESS! Login flow is working perfectly!');
        console.log('✅ User can login with email/password');
        console.log('✅ Token is valid for authenticated requests');
        console.log('✅ Backend bug is completely fixed');
        
        return true;
        
    } catch (error) {
        console.error('❌ Login flow failed:', error.message);
        return false;
    }
}

testCompleteLoginFlow();