// Complete the signup flow properly
const API_BASE = 'https://ai-news-scraper-ln76nqcdr.vercel.app';

async function completeSignupFlow() {
    console.log('🔄 Attempting to complete signup flow...');
    
    const userData = {
        name: 'Dhanyashree Vijayan',
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    console.log('Step 1: Initiating signup process...');
    
    try {
        // Step 1: Initiate signup (should send OTP)
        const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const signupData = await signupResponse.json();
        console.log('Signup Response:', signupResponse.status, signupData);
        
        if (signupData.otpSent) {
            console.log('\n📧 OTP has been sent to your email.');
            console.log('Please check your email and use the OTP with the verify-otp endpoint.');
            console.log('\nOnce you have the OTP, you can verify it using:');
            console.log(`
curl -X POST ${API_BASE}/api/auth/verify-otp \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${userData.email}",
    "otp": "YOUR_OTP_HERE",
    "userData": ${JSON.stringify(userData)}
  }'`);
            
            console.log('\nOr you can complete it in the frontend by:');
            console.log('1. Go to http://localhost:5173/auth?mode=signup');
            console.log('2. Enter the same email/password');
            console.log('3. Complete OTP verification when prompted');
            
            return true;
        }
        
    } catch (error) {
        console.error('❌ Signup flow error:', error);
        return false;
    }
    
    return false;
}

// Also provide a direct verification function if user has OTP
async function verifyWithOTP(otp) {
    const userData = {
        name: 'Dhanyashree Vijayan',
        email: 'dhanyashreevijayan@gmail.com',
        password: 'Arunmugam1!'
    };
    
    try {
        const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                otp: otp,
                userData: userData
            })
        });
        
        const verifyData = await verifyResponse.json();
        console.log('Verification Response:', verifyResponse.status, verifyData);
        
        if (verifyResponse.ok && verifyData.token) {
            console.log('✅ Account verified successfully!');
            console.log('Token:', verifyData.token);
            console.log('You can now login normally.');
            return verifyData.token;
        } else {
            console.log('❌ Verification failed:', verifyData.message);
        }
        
    } catch (error) {
        console.error('❌ Verification error:', error);
    }
    
    return null;
}

console.log('🚀 Starting signup completion process...');
completeSignupFlow();

console.log('\n📝 If you have an OTP, uncomment and run:');
console.log('// verifyWithOTP("YOUR_OTP_CODE");');