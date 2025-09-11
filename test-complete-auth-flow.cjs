// Test Complete Authentication Flow
const puppeteer = require('puppeteer');

async function testCompleteAuthFlow() {
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
    
    const frontendUrl = 'https://ai-news-react-34jwtvqgh-vijayan-subramaniyans-projects-0c70c64d.vercel.app';
    
    console.log('🔍 Testing Complete Authentication Flow...');
    console.log('Frontend URL:', frontendUrl);
    console.log('Backend URL: https://ai-news-scraper-edytw30cl.vercel.app');
    
    // Step 1: Go to auth page
    console.log('\n1. Loading auth page...');
    await page.goto(`${frontendUrl}/auth`, { waitUntil: 'networkidle0' });
    
    // Check if Google sign-in button exists
    const googleButton = await page.$('.google-signin-btn');
    console.log('✅ Google sign-in button found:', !!googleButton);
    
    // Step 2: Test regular signup/login
    console.log('\n2. Testing signup flow...');
    
    // Switch to signup mode if not already
    const signupToggle = await page.$('.toggle-btn:not(.active)');
    if (signupToggle) {
      await signupToggle.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Fill out signup form with unique email
    const testEmail = `testuser${Date.now()}@example.com`;
    const testName = 'Test User Auth Flow';
    const testPassword = 'testpassword123';
    
    console.log('📝 Filling out signup form...');
    await page.type('input[type="text"]', testName);
    await page.type('input[type="email"]', testEmail);
    await page.type('input[id="password"]', testPassword);
    await page.type('input[id="confirmPassword"]', testPassword);
    
    // Accept terms
    await page.click('input[type="checkbox"]');
    
    console.log('✅ Form filled with email:', testEmail);
    
    // Submit form
    console.log('\n3. Submitting signup form...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check current URL and auth state
    const currentUrl = page.url();
    console.log('✅ URL after signup:', currentUrl);
    
    // Check if auth token is stored
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    console.log('✅ Auth token exists:', !!authToken);
    
    if (authToken) {
      console.log('✅ Token (first 50 chars):', authToken.substring(0, 50) + '...');
    }
    
    // Step 4: Check dashboard
    console.log('\n4. Testing dashboard access...');
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: 'networkidle0' });
    
    // Wait for auth debug logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for sign out button
    const signOutButton = await page.$('.desktop-action-icon.logout-action, .logout-action');
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
      const actionsHTML = await page.evaluate(el => el.innerHTML, desktopUserActions);
      const hasActions = actionsHTML.trim().length > 0;
      console.log('✅ Desktop actions has content:', hasActions);
      if (hasActions) {
        console.log('📝 Desktop actions content preview:', actionsHTML.substring(0, 200) + '...');
      }
    }
    
    // Step 5: Test preferences
    console.log('\n5. Testing user preferences...');
    const preferencesLink = await page.$('a[href="/preferences"], .desktop-action-icon:not(.logout-action):not(.premium-action)');
    if (preferencesLink) {
      await preferencesLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const preferencesUrl = page.url();
      console.log('✅ Preferences URL:', preferencesUrl);
    } else {
      console.log('❌ Preferences link not found');
    }
    
    console.log('\n🎉 Complete authentication flow test completed!');
    
    // Summary
    const summary = {
      googleButtonVisible: !!googleButton,
      authTokenStored: !!authToken,
      signOutButtonVisible: !!signOutButton,
      settingsButtonVisible: !!settingsButton,
      userGreetingVisible: !!userGreeting,
      desktopActionsVisible: !!desktopUserActions
    };
    
    console.log('\n📊 Test Summary:', summary);
    
    const allWorking = Object.values(summary).every(v => v);
    console.log(allWorking ? '🎯 ALL TESTS PASSED!' : '⚠️ Some features need attention');
    
    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 15 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCompleteAuthFlow().catch(console.error);