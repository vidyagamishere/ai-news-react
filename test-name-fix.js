// Test the user name fix
async function testNameFix() {
    console.log('🧪 Testing User Name Fix');
    console.log('=======================');
    
    const BACKEND_URL = 'https://ai-news-scraper.vercel.app';
    
    const credentials = {
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    console.log('👤 Testing login with:', credentials.email);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok && data.user) {
            console.log('✅ Login successful!');
            console.log('📛 User Name:', data.user.name);
            console.log('📧 Email:', data.user.email);
            console.log('🆔 User ID:', data.user.id);
            console.log('🏷️ Subscription:', data.user.subscriptionTier);
            
            if (data.user.name === 'Dhanyashree Vijayan') {
                console.log('\n🎉 SUCCESS! User name is now correctly displaying as "Dhanyashree Vijayan"');
                console.log('✅ The name fix is working perfectly!');
            } else {
                console.log('\n⚠️  User name is still showing as:', data.user.name);
                console.log('❓ Expected: Dhanyashree Vijayan');
            }
            
            // Test profile endpoint to make sure it's consistent
            console.log('\n🔍 Testing profile endpoint...');
            const profileResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('📛 Profile Name:', profileData.name);
                
                if (profileData.name === 'Dhanyashree Vijayan') {
                    console.log('✅ Profile endpoint also shows correct name!');
                } else {
                    console.log('⚠️  Profile endpoint shows:', profileData.name);
                }
            }
            
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Visit: https://ai-news-react.vercel.app');
    console.log('2. Login with your credentials');
    console.log('3. Check if dashboard shows "Dhanyashree Vijayan" instead of "Test User"');
}

testNameFix();