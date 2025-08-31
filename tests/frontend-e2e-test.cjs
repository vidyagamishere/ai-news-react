#!/usr/bin/env node

/**
 * AI News Digest - Frontend End-to-End Test
 * Tests frontend functionality including navigation and user flows
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class FrontendE2ETester {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.testResults = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.browser = null;
    this.page = null;
  }

  async setup() {
    try {
      this.browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Set viewport for consistent testing
      await this.page.setViewport({ width: 1280, height: 720 });
      
      // Enable console logging
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`Browser Error: ${msg.text()}`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Setup failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  logTest(testName, passed, details = {}) {
    this.testCount++;
    if (passed) {
      this.passCount++;
      console.log(`✅ ${testName}`);
    } else {
      this.failCount++;
      console.log(`❌ ${testName}`);
      if (details.error) {
        console.log(`   Error: ${details.error}`);
      }
    }
    
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testLandingPageLoad() {
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
      
      const title = await this.page.title();
      const heading = await this.page.$eval('h1', el => el.textContent);
      const ctaButtons = await this.page.$$('.cta-buttons .btn');
      
      const passed = title.includes('AI News') && 
                   heading.includes('Stay Ahead in AI') && 
                   ctaButtons.length >= 2;
      
      this.logTest('Landing Page Load', passed, { 
        title, 
        heading, 
        buttonCount: ctaButtons.length 
      });
    } catch (error) {
      this.logTest('Landing Page Load', false, { error: error.message });
    }
  }

  async testNavigationToSignUp() {
    try {
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('.cta-buttons .btn-primary');
      
      const signUpButton = await this.page.$('.cta-buttons .btn-primary');
      await signUpButton.click();
      
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      const currentUrl = this.page.url();
      const heading = await this.page.$eval('h2', el => el.textContent);
      
      const passed = currentUrl.includes('/signup') && 
                   heading.includes('Join AI News Digest');
      
      this.logTest('Navigation to Sign Up', passed, { 
        currentUrl, 
        heading 
      });
    } catch (error) {
      this.logTest('Navigation to Sign Up', false, { error: error.message });
    }
  }

  async testNavigationToSignIn() {
    try {
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('.cta-buttons .btn-ghost');
      
      const signInButton = await this.page.$('.cta-buttons .btn-ghost');
      await signInButton.click();
      
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      const currentUrl = this.page.url();
      const heading = await this.page.$eval('h2', el => el.textContent);
      
      const passed = currentUrl.includes('/signin') && 
                   heading.includes('Welcome back');
      
      this.logTest('Navigation to Sign In', passed, { 
        currentUrl, 
        heading 
      });
    } catch (error) {
      this.logTest('Navigation to Sign In', false, { error: error.message });
    }
  }

  async testSignUpFormValidation() {
    try {
      await this.page.goto(`${this.baseUrl}/signup`);
      await this.page.waitForSelector('.auth-form');
      
      // Test empty form submission
      const submitButton = await this.page.$('.auth-submit');
      await submitButton.click();
      
      // Check if browser validation messages appear (required fields)
      const nameInput = await this.page.$('#name');
      const emailInput = await this.page.$('#email');
      const passwordInput = await this.page.$('#password');
      
      const nameRequired = await this.page.evaluate(el => el.validationMessage, nameInput);
      const emailRequired = await this.page.evaluate(el => el.validationMessage, emailInput);
      const passwordRequired = await this.page.evaluate(el => el.validationMessage, passwordInput);
      
      const passed = nameRequired.includes('fill') || 
                   emailRequired.includes('fill') || 
                   passwordRequired.includes('fill');
      
      this.logTest('Sign Up Form Validation', passed, { 
        nameRequired, 
        emailRequired, 
        passwordRequired 
      });
    } catch (error) {
      this.logTest('Sign Up Form Validation', false, { error: error.message });
    }
  }

  async testSignUpFlow() {
    try {
      await this.page.goto(`${this.baseUrl}/signup`);
      await this.page.waitForSelector('.auth-form');
      
      const testUser = {
        name: 'E2E Test User',
        email: `e2e.test.${Date.now()}@example.com`,
        password: 'E2ETestPassword123!'
      };
      
      // Fill form
      await this.page.type('#name', testUser.name);
      await this.page.type('#email', testUser.email);
      await this.page.type('#password', testUser.password);
      await this.page.type('#confirmPassword', testUser.password);
      
      // Submit form
      await this.page.click('.auth-submit');
      
      // Wait for navigation or error
      try {
        await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        const currentUrl = this.page.url();
        const passed = currentUrl.includes('/dashboard');
        
        this.logTest('Sign Up Flow - Complete', passed, { 
          finalUrl: currentUrl,
          testUser: { ...testUser, password: '[REDACTED]' }
        });
      } catch (navError) {
        // Check if there's an error message instead
        const errorElement = await this.page.$('.auth-error');
        const errorText = errorElement ? await this.page.evaluate(el => el.textContent, errorElement) : '';
        
        this.logTest('Sign Up Flow - Complete', false, { 
          error: 'Navigation failed or error occurred',
          errorMessage: errorText
        });
      }
    } catch (error) {
      this.logTest('Sign Up Flow - Complete', false, { error: error.message });
    }
  }

  async testResponsiveDesign() {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: '4K', width: 2560, height: 1440 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.goto(this.baseUrl);
        await this.page.waitForSelector('.hero-content');
        
        const isResponsive = await this.page.evaluate(() => {
          const heroContent = document.querySelector('.hero-content');
          const ctaButtons = document.querySelector('.cta-buttons');
          
          return heroContent && ctaButtons && 
                 heroContent.offsetWidth > 0 && 
                 ctaButtons.offsetWidth > 0;
        });
        
        this.logTest(`Responsive Design - ${viewport.name}`, isResponsive, { 
          viewport: `${viewport.width}x${viewport.height}` 
        });
      } catch (error) {
        this.logTest(`Responsive Design - ${viewport.name}`, false, { error: error.message });
      }
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const successRate = ((this.passCount / this.testCount) * 100).toFixed(1);
    
    const report = {
      testSuite: 'AI News Digest - Frontend E2E Tests',
      timestamp,
      summary: {
        total: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        successRate: `${successRate}%`
      },
      configuration: {
        frontendUrl: this.baseUrl
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.failCount > 0) {
      recommendations.push('Review failed test cases and fix UI/UX issues');
    }
    
    const responsiveTests = this.testResults.filter(t => t.name.includes('Responsive'));
    const failedResponsive = responsiveTests.filter(t => !t.passed);
    
    if (failedResponsive.length > 0) {
      recommendations.push('Fix responsive design issues for better mobile experience');
    }

    const navigationTests = this.testResults.filter(t => t.name.includes('Navigation'));
    const failedNavigation = navigationTests.filter(t => !t.passed);
    
    if (failedNavigation.length > 0) {
      recommendations.push('Fix navigation and routing issues');
    }

    return recommendations;
  }

  async runAllTests() {
    console.log('🎭 Starting AI News Digest Frontend E2E Tests\n');
    console.log(`Frontend URL: ${this.baseUrl}\n`);

    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      console.error('❌ Failed to setup browser for testing');
      return;
    }

    try {
      // Basic functionality tests
      console.log('🌐 Testing Basic Functionality...');
      await this.testLandingPageLoad();
      await this.testNavigationToSignUp();
      await this.testNavigationToSignIn();
      console.log('');

      // Form validation tests
      console.log('📝 Testing Form Validation...');
      await this.testSignUpFormValidation();
      console.log('');

      // Complete user flows
      console.log('👤 Testing User Flows...');
      await this.testSignUpFlow();
      console.log('');

      // Responsive design tests
      console.log('📱 Testing Responsive Design...');
      await this.testResponsiveDesign();
      console.log('');

    } finally {
      await this.cleanup();
    }

    // Generate and display report
    const report = this.generateReport();
    
    console.log('📊 Frontend Test Results Summary:');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log('');

    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`- ${rec}`));
      console.log('');
    }

    // Write detailed report to file
    const reportPath = `./test-reports/frontend-e2e-report-${Date.now()}.json`;
    
    try {
      if (!fs.existsSync('./test-reports')) {
        fs.mkdirSync('./test-reports', { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️  Could not save report: ${error.message}`);
    }

    return report;
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new FrontendE2ETester();
  tester.runAllTests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Frontend E2E test suite failed:', error);
      process.exit(1);
    });
}

module.exports = FrontendE2ETester;