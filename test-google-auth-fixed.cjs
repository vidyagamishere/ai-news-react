// Test Google Authentication Flow with Debug Logs
const puppeteer = require('puppeteer');

async function testGoogleAuthFlow() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    const frontendUrl = 'https://ai-news-react-3eh83fzf4-vijayan-subramaniyans-projects-0c70c64d.vercel.app';
    
    console.log('🔍 Testing Authentication Flow...');
    console.log('Frontend URL:', frontendUrl);
    
    // Go to auth page
    console.log('\n1. Loading auth page...');
    await page.goto(`${frontendUrl}/auth`, { waitUntil: 'networkidle0' });
    
    // Check if Google sign-in button exists
    const googleButton = await page.$('.google-signin-btn');
    console.log('✅ Google sign-in button found:', !!googleButton);
    
    if (googleButton) {
      const buttonText = await page.evaluate(btn => btn.textContent, googleButton);
      console.log('✅ Button text:', buttonText.trim());
    }
    
    // Test regular email signup first to verify auth flow
    console.log('\n2. Testing regular email authentication...');
    
    // Switch to signup mode
    const signupButton = await page.$('button.toggle-btn:not(.active)');
    if (signupButton) {
      await signupButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Fill out signup form
    await page.type('input[type="text"]', 'Test User');
    await page.type('input[type="email"]', 'testuser@example.com');
    await page.type('input[type="password"]', 'testpassword123');
    await page.type('input[id="confirmPassword"]', 'testpassword123');
    
    // Accept terms
    await page.click('input[type="checkbox"]');
    
    console.log('✅ Form filled successfully');
    
    // Try to submit (this will likely fail but we can see the response)
    console.log('\n3. Attempting form submission...');
    await page.click('button[type="submit"]');
    
    // Wait for response and check console logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we're redirected or see any auth state
    const currentUrl = page.url();
    console.log('✅ Current URL after submission:', currentUrl);
    
    // Check localStorage for auth tokens
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const adminAuth = await page.evaluate(() => localStorage.getItem('adminAuth'));
    
    console.log('✅ Auth token exists:', !!authToken);
    console.log('✅ Admin auth exists:', !!adminAuth);
    
    console.log('\n4. Testing dashboard access...');
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: 'networkidle0' });
    
    // Wait for any auth debug logs
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for sign out button
    const signOutButton = await page.$('.logout-action, .desktop-action-icon.logout-action');
    console.log('✅ Sign out button found:', !!signOutButton);
    
    // Check for user greeting
    const userGreeting = await page.$('.user-greeting-text, .mobile-greeting-text');
    console.log('✅ User greeting found:', !!userGreeting);
    
    if (userGreeting) {
      const greetingText = await page.evaluate(el => el.textContent, userGreeting);
      console.log('✅ Greeting text:', greetingText.trim());
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testGoogleAuthFlow().catch(console.error);