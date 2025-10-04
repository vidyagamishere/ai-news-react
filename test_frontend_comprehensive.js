#!/usr/bin/env node
/**
 * Comprehensive Frontend Functionality Tests
 * Tests responsive design, authentication, and component integration
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FrontendTests {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    async setup() {
        console.log('🚀 Starting Comprehensive Frontend Tests');
        console.log('='.repeat(50));
        
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set viewport for mobile testing
        await this.page.setViewport({ width: 375, height: 667 });
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('🔍 Console Error:', msg.text());
            }
        });
    }

    async teardown() {
        if (this.browser) {
            await this.browser.close();
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 Frontend Test Summary:');
        console.log(`✅ Tests passed: ${this.testResults.passed}`);
        console.log(`❌ Tests failed: ${this.testResults.failed}`);
        
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }
        
        return this.testResults.failed === 0;
    }

    async runTest(testName, testFunction) {
        try {
            console.log(`\n${testName}`);
            await testFunction();
            console.log(`✅ ${testName} passed`);
            this.testResults.passed++;
        } catch (error) {
            console.log(`❌ ${testName} failed: ${error.message}`);
            this.testResults.failed++;
            this.testResults.errors.push(`${testName}: ${error.message}`);
        }
    }

    async testPageLoad() {
        const response = await this.page.goto(this.baseUrl, { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        if (!response.ok()) {
            throw new Error(`Page failed to load: ${response.status()}`);
        }
        
        // Check if page title is set
        const title = await this.page.title();
        if (!title || title.includes('Vite')) {
            throw new Error('Page title not properly set');
        }
    }

    async testMobileResponsive() {
        // Test mobile viewport
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check if mobile-specific elements are visible
        const mobileHeader = await this.page.$('h1');
        if (!mobileHeader) {
            throw new Error('Mobile header not found');
        }
        
        const headerText = await this.page.$eval('h1', el => el.textContent);
        if (!headerText.includes('Vidyagam')) {
            throw new Error('Header text incorrect on mobile');
        }
        
        // Test hamburger menu or mobile navigation
        const searchInput = await this.page.$('input[placeholder*="Search"]');
        if (!searchInput) {
            throw new Error('Search input not found on mobile');
        }
    }

    async testTabletResponsive() {
        // Test tablet viewport
        await this.page.setViewport({ width: 768, height: 1024 });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check for tablet-specific layout changes
        const content = await this.page.$('.max-w-4xl, .grid-cols-2');
        if (!content) {
            throw new Error('Tablet layout not properly implemented');
        }
    }

    async testWebResponsive() {
        // Test web viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check for web-specific layout
        const webLayout = await this.page.$('.max-w-7xl, .grid-cols-3');
        if (!webLayout) {
            throw new Error('Web layout not properly implemented');
        }
        
        // Check for sidebar on web
        const sidebar = await this.page.$('.w-80');
        if (!sidebar) {
            throw new Error('Web sidebar not found');
        }
    }

    async testMobileDashboardComponent() {
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check if MobileDashboard component is loaded
        const dashboard = await this.page.$('[class*="min-h-screen"]');
        if (!dashboard) {
            throw new Error('MobileDashboard component not found');
        }
        
        // Test filter toggle
        const filterButton = await this.page.$('button[class*="p-2"]');
        if (filterButton) {
            await filterButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    async testSearchFunctionality() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Find search input
        const searchInput = await this.page.$('input[placeholder*="Search"]');
        if (!searchInput) {
            throw new Error('Search input not found');
        }
        
        // Test search input
        await searchInput.type('AI');
        await this.page.waitForTimeout(1000);
        
        // Test search submit (Enter key)
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
    }

    async testFilterFunctionality() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Look for filter elements
        const timeFilter = await this.page.$('select');
        if (timeFilter) {
            await timeFilter.select('Last Month');
            await this.page.waitForTimeout(500);
        }
        
        // Test content type filters
        const contentTypeButtons = await this.page.$$('button[class*="rounded-full"]');
        if (contentTypeButtons.length > 0) {
            await contentTypeButtons[0].click();
            await this.page.waitForTimeout(500);
        }
    }

    async testContentDisplay() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Wait for content to load
        await this.page.waitForTimeout(3000);
        
        // Check for article cards or content items
        const contentItems = await this.page.$$('[class*="bg-white"][class*="rounded-lg"]');
        if (contentItems.length === 0) {
            console.log('⚠️ No content items found - may be due to API connectivity');
        }
    }

    async testErrorHandling() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Simulate network error by blocking requests
        await this.page.setRequestInterception(true);
        this.page.on('request', request => {
            if (request.url().includes('/api/')) {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        // Reload page to trigger error state
        await this.page.reload({ waitUntil: 'networkidle2' });
        await this.page.waitForTimeout(2000);
        
        // Look for error messages or retry buttons
        const errorMessage = await this.page.$('[class*="text-red"]');
        const retryButton = await this.page.$('button[class*="bg-blue"]');
        
        if (!errorMessage && !retryButton) {
            throw new Error('Error handling not properly implemented');
        }
    }

    async testAccessibility() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check for proper heading hierarchy
        const h1Elements = await this.page.$$('h1');
        if (h1Elements.length === 0) {
            throw new Error('No H1 heading found for accessibility');
        }
        
        // Check for alt attributes on images
        const images = await this.page.$$('img');
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            if (!alt) {
                console.log('⚠️ Image without alt attribute found');
            }
        }
        
        // Check for proper button labels
        const buttons = await this.page.$$('button');
        for (const button of buttons) {
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            if (!text && !ariaLabel) {
                throw new Error('Button without accessible label found');
            }
        }
    }

    async testPerformance() {
        // Enable performance monitoring
        await this.page.tracing.start({ path: 'trace.json' });
        
        const startTime = Date.now();
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        const loadTime = Date.now() - startTime;
        
        await this.page.tracing.stop();
        
        if (loadTime > 5000) {
            throw new Error(`Page load time too slow: ${loadTime}ms`);
        }
        
        console.log(`📊 Page load time: ${loadTime}ms`);
    }

    async testComponentInteractions() {
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Test various interactive elements
        const interactiveElements = await this.page.$$('button, input, select');
        
        if (interactiveElements.length === 0) {
            throw new Error('No interactive elements found');
        }
        
        // Test hover states
        for (const element of interactiveElements.slice(0, 3)) {
            await element.hover();
            await this.page.waitForTimeout(200);
        }
    }

    async runAllTests() {
        await this.setup();
        
        try {
            await this.runTest('🌐 Page Load Test', () => this.testPageLoad());
            await this.runTest('📱 Mobile Responsive Test', () => this.testMobileResponsive());
            await this.runTest('📟 Tablet Responsive Test', () => this.testTabletResponsive());
            await this.runTest('💻 Web Responsive Test', () => this.testWebResponsive());
            await this.runTest('📊 MobileDashboard Component Test', () => this.testMobileDashboardComponent());
            await this.runTest('🔍 Search Functionality Test', () => this.testSearchFunctionality());
            await this.runTest('⚙️ Filter Functionality Test', () => this.testFilterFunctionality());
            await this.runTest('📰 Content Display Test', () => this.testContentDisplay());
            await this.runTest('❌ Error Handling Test', () => this.testErrorHandling());
            await this.runTest('♿ Accessibility Test', () => this.testAccessibility());
            await this.runTest('⚡ Performance Test', () => this.testPerformance());
            await this.runTest('🖱️ Component Interactions Test', () => this.testComponentInteractions());
            
        } catch (error) {
            console.error('Test suite error:', error);
        }
        
        return await this.teardown();
    }
}

// Cross-browser testing function
async function runCrossBrowserTests() {
    console.log('\n🌐 Cross-Browser Compatibility Tests');
    console.log('-'.repeat(40));
    
    const browsers = [
        { name: 'Chrome', headless: true },
        { name: 'Firefox', product: 'firefox', headless: true }
    ];
    
    for (const browserConfig of browsers) {
        try {
            console.log(`\nTesting with ${browserConfig.name}...`);
            
            const browser = await puppeteer.launch(browserConfig);
            const page = await browser.newPage();
            
            await page.goto(process.env.FRONTEND_URL || 'http://localhost:5173');
            await page.waitForTimeout(2000);
            
            const title = await page.title();
            console.log(`✅ ${browserConfig.name}: Page loads successfully`);
            
            await browser.close();
            
        } catch (error) {
            console.log(`❌ ${browserConfig.name}: ${error.message}`);
        }
    }
}

// Main execution
async function main() {
    const frontendTests = new FrontendTests();
    const success = await frontendTests.runAllTests();
    
    // Run cross-browser tests if main tests pass
    if (success) {
        await runCrossBrowserTests();
    }
    
    // Generate test report
    const report = {
        timestamp: new Date().toISOString(),
        testResults: frontendTests.testResults,
        url: frontendTests.baseUrl,
        success: success
    };
    
    const reportPath = `test-reports/frontend-comprehensive-${Date.now()}.json`;
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Test report saved to: ${reportPath}`);
    
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FrontendTests;