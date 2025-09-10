// Test login after successful verification
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function testLoginAfterVerification() {
    console.log('🔍 Testing login after successful OTP verification...');
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    console.log('Attempting login with credentials:', {
        email: credentials.email,
        password: '***' + credentials.password.slice(-2)
    });
    
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
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('🎉 The authentication issue has been resolved!');
            console.log('User details:', data.user);
            console.log('Token received:', data.token ? 'Yes' : 'No');
            
            // Test token validation
            if (data.token) {
                console.log('\n🔐 Testing token validation...');
                const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const profileData = await profileResponse.json();
                console.log('Profile fetch:', profileResponse.status, profileData);
            }
            
        } else {
            console.log('❌ LOGIN STILL FAILING:', data.message);
            console.log('This suggests there might be a backend parsing issue.');
            
            // Try different approaches
            console.log('\n🔧 Trying alternative approaches...');
            
            // Try with different header combinations
            const altResponse = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const altData = await altResponse.json();
            console.log('Alternative headers result:', altResponse.status, altData);
        }
        
    } catch (error) {
        console.error('❌ Request error:', error);
    }
}

testLoginAfterVerification();