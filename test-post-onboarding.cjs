// Test Authentication After Completing Onboarding
const puppeteer = require('puppeteer');

async function testPostOnboarding() {
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
    
    console.log('🔍 Testing Post-Onboarding Authentication...');
    
    // Manually set auth tokens to simulate a user who has signed up
    await page.goto(`${frontendUrl}`, { waitUntil: 'networkidle0' });
    
    console.log('\n1. Setting up authenticated user state...');
    
    await page.evaluate(() => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl82QzlLdU4zVlJ3T2RtQjR5cmNuSzdRIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInN1YnNjcmlwdGlvbl90aWVyIjoiZnJlZSIsImV4cCI6MTc2MDE0ODA2NSwiaWF0IjoxNzU3NTU2MDY1fQ.nHZZ3BwjGcXgRatLZxr5ctd2Frq28ZqoUbxPU_n0wIA';
      localStorage.setItem('authToken', mockToken);
      
      // Mark onboarding as completed
      localStorage.setItem('onboardingComplete', 'true');
      
      console.log('✅ Auth token and onboarding completion set');
    });
    
    console.log('\n2. Navigating to dashboard...');
    await page.goto(`${frontendUrl}/dashboard`, { waitUntil: 'networkidle0' });
    
    // Wait for auth context to initialize and debug logs to appear
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n3. Checking authentication state...');
    
    // Check for Header auth debug logs in console
    console.log('📝 Looking for Header Auth Debug logs in browser console...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're still on dashboard (not redirected to onboarding)
    const currentUrl = page.url();
    console.log('✅ Current URL:', currentUrl);
    const isOnDashboard = currentUrl.includes('/dashboard');
    console.log('✅ Is on dashboard:', isOnDashboard);
    
    // Check for auth elements
    const signOutButton = await page.$('.desktop-action-icon.logout-action, .logout-action');
    console.log('✅ Sign out button found:', !!signOutButton);
    
    const settingsButton = await page.$('.desktop-action-icon:not(.logout-action):not(.premium-action)');  
    console.log('✅ Settings button found:', !!settingsButton);
    
    const userGreeting = await page.$('.user-greeting-text, .desktop-user-greeting .user-greeting-text');
    console.log('✅ User greeting found:', !!userGreeting);
    
    if (userGreeting) {
      const greetingText = await page.evaluate(el => el.textContent, userGreeting);
      console.log('✅ Greeting text:', greetingText.trim());
    }
    
    // Check desktop user actions
    const desktopUserActions = await page.$('.desktop-user-actions');
    console.log('✅ Desktop user actions found:', !!desktopUserActions);
    
    if (desktopUserActions) {
      const actionsHTML = await page.evaluate(el => el.innerHTML, desktopUserActions);
      console.log('✅ Desktop actions HTML length:', actionsHTML.length);
      console.log('📝 Desktop actions preview:', actionsHTML.substring(0, 300));
    }
    
    // Check if we see the onboarding instead of dashboard content
    const onboardingContent = await page.$('.onboarding-app, .welcome-overlay');
    console.log('✅ Onboarding content visible:', !!onboardingContent);
    
    // Check for dashboard content
    const topStories = await page.$('.top-stories');
    console.log('✅ Dashboard top stories visible:', !!topStories);
    
    const metricsSection = await page.$('.metrics-section');
    console.log('✅ Dashboard metrics visible:', !!metricsSection);
    
    // Check auth token status
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const onboardingComplete = await page.evaluate(() => localStorage.getItem('onboardingComplete'));
    console.log('✅ Auth token exists:', !!authToken);
    console.log('✅ Onboarding marked complete:', onboardingComplete);
    
    console.log('\n4. Manual inspection time...');
    console.log('🔍 Check the browser to see what authentication elements are visible');
    console.log('🔍 Look for Header Auth Debug logs in browser console');
    
    // Keep browser open longer for inspection
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testPostOnboarding().catch(console.error);