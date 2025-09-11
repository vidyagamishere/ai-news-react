// Test Authentication State Manually
const puppeteer = require('puppeteer');

async function testManualAuthState() {
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
    
    console.log('🔍 Testing Manual Authentication State...');
    
    // Go to dashboard
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: 'networkidle0' });
    
    console.log('\n1. Setting up mock authentication state...');
    
    // Manually set auth tokens to simulate Google login
    await page.evaluate(() => {
      // Mock a Google user token and user data
      const mockToken = 'mock-google-jwt-token-12345';
      const mockUser = {
        id: 'google-user-123',
        email: 'testuser@gmail.com',
        name: 'Google Test User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        preferences: {
          onboardingCompleted: false,
          topics: [],
          newsletterFrequency: 'daily',
          contentTypes: ['articles'],
          emailNotifications: true
        },
        subscriptionTier: 'free'
      };
      
      localStorage.setItem('authToken', mockToken);
      console.log('✅ Mock auth token set:', mockToken);
      console.log('✅ Mock user data created:', JSON.stringify(mockUser, null, 2));
    });
    
    console.log('\n2. Reloading page to test auth state...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Wait for auth initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n3. Checking authentication state...');
    
    // Check for Header auth debug logs
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for sign out button
    const signOutButton = await page.$('.logout-action, .desktop-action-icon.logout-action');
    console.log('✅ Sign out button found:', !!signOutButton);
    
    // Check for settings button
    const settingsButton = await page.$('.desktop-action-icon:not(.logout-action):not(.premium-action)');
    console.log('✅ Settings button found:', !!settingsButton);
    
    // Check for user greeting
    const userGreeting = await page.$('.user-greeting-text, .mobile-greeting-text');
    console.log('✅ User greeting found:', !!userGreeting);
    
    if (userGreeting) {
      const greetingText = await page.evaluate(el => el.textContent, userGreeting);
      console.log('✅ Greeting text:', greetingText.trim());
    }
    
    // Check for desktop user actions container
    const desktopUserActions = await page.$('.desktop-user-actions');
    console.log('✅ Desktop user actions container found:', !!desktopUserActions);
    
    if (desktopUserActions) {
      const actionsContent = await page.evaluate(el => el.innerHTML, desktopUserActions);
      console.log('✅ Desktop actions HTML:', actionsContent);
    }
    
    // Check current auth state in localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const adminAuth = await page.evaluate(() => localStorage.getItem('adminAuth'));
    
    console.log('✅ Auth token exists:', !!authToken);
    console.log('✅ Admin auth exists:', !!adminAuth);
    
    console.log('\n4. Testing Google-specific onboarding flow...');
    
    // Check if onboarding is triggered for new Google users
    const onboardingModal = await page.$('.onboarding-app, .welcome-overlay');
    console.log('✅ Onboarding/Welcome modal found:', !!onboardingModal);
    
    console.log('\n🎉 Manual auth state test completed!');
    
    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testManualAuthState().catch(console.error);