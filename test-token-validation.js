// Test Token Validation Process
const API_BASE = 'https://ai-news-scraper.vercel.app';

async function testTokenValidation() {
  console.log('🔍 Testing Token Validation Process...');
  
  try {
    // First, try to create a real user via Google auth simulation
    console.log('\n1. Testing Google authentication...');
    
    // We'll simulate what happens during Google sign-in
    const mockGoogleIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNzkzNjUifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiNDUwNDM1MDk2NTM2LXRib3Ixc2JrYnEyN3NpNjJwczdraDI1ZGF0NWluZGIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMjM0NTY3ODkwMTIzNDU2Nzg5IiwiZW1haWwiOiJ0ZXN0dXNlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6Ikdvb2dsZSBUZXN0IFVzZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvZGVmYXVsdC11c2VyPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ikdvb2dsZSIsImZhbWlseV9uYW1lIjoiVGVzdCIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjgyNTIwMDAwLCJleHAiOjE2ODI1MjM2MDB9.mock-signature';
    
    const googleResponse = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: mockGoogleIdToken }),
    });
    
    if (googleResponse.ok) {
      const authData = await googleResponse.json();
      console.log('✅ Google auth successful:', authData.user?.email || 'unknown');
      console.log('✅ Token received:', authData.token?.substring(0, 20) + '...' || 'none');
      
      // Now test token validation
      console.log('\n2. Testing token validation...');
      
      const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('✅ Token validation successful:', profile.email);
        console.log('✅ User data:', JSON.stringify(profile, null, 2));
      } else {
        const error = await profileResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.log('❌ Token validation failed:', profileResponse.status, error.message);
      }
      
    } else {
      const error = await googleResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ Google auth failed:', googleResponse.status, error.message);
      
      if (googleResponse.status === 400) {
        console.log('ℹ️ This is expected - we used a mock token');
        
        // Let's test with a regular signup/login instead
        console.log('\n3. Testing regular authentication...');
        
        const testEmail = 'tokentest@example.com';
        const testPassword = 'testpassword123';
        
        // Try signup first
        const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
            name: 'Token Test User',
            acceptTerms: true
          }),
        });
        
        let authToken;
        
        if (signupResponse.ok) {
          const signupData = await signupResponse.json();
          if (signupData.user && signupData.token) {
            console.log('✅ Signup successful:', signupData.user.email);
            authToken = signupData.token;
          }
        } else {
          // Try login instead
          const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: testEmail,
              password: testPassword,
            }),
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful:', loginData.user.email);
            authToken = loginData.token;
          } else {
            const error = await loginResponse.json().catch(() => ({ message: 'Unknown error' }));
            console.log('❌ Login failed:', loginResponse.status, error.message);
          }
        }
        
        if (authToken) {
          console.log('\n4. Testing token validation with regular user token...');
          
          const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            console.log('✅ Token validation successful for regular user:', profile.email);
            console.log('✅ User preferences:', profile.preferences || 'none');
          } else {
            const error = await profileResponse.json().catch(() => ({ message: 'Unknown error' }));
            console.log('❌ Token validation failed for regular user:', profileResponse.status, error.message);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTokenValidation().catch(console.error);