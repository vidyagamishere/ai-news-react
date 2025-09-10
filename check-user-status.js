// Check user account status
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function checkUserStatus() {
    console.log('🔍 Checking user account status...');
    
    const email = 'dhanyashreevijayan@gmail.com';
    
    // Test 1: Can we send OTP (user exists)
    try {
        const otpResponse = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const otpData = await otpResponse.json();
        console.log('✅ OTP Test:', otpResponse.status, otpData);
        
        if (otpResponse.ok) {
            console.log('📧 User email exists in system, OTP can be sent');
        }
        
    } catch (error) {
        console.error('❌ OTP Test failed:', error);
    }
    
    // Test 2: Try signup to see what happens (already exists?)
    try {
        const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password: 'newpassword123', 
                name: 'Test User' 
            })
        });
        
        const signupData = await signupResponse.json();
        console.log('📝 Signup Test:', signupResponse.status, signupData);
        
    } catch (error) {
        console.error('❌ Signup Test failed:', error);
    }
    
    console.log('\n🔬 Analysis:');
    console.log('- If OTP works but login fails: User exists but password is wrong');
    console.log('- If signup shows "user already exists": User completed registration');
    console.log('- If signup shows OTP required: User may be in pending verification state');
    console.log('\n💡 Recommendation:');
    console.log('- Try completing signup flow with OTP verification');
    console.log('- Or use password reset functionality');
    console.log('- Or try Google Sign In if user registered via Google');
}

checkUserStatus();