#!/usr/bin/env node

/**
 * AI News Digest - Authentication Flow Automation Test
 * Tests all authentication scenarios and generates comprehensive reports
 */

const https = require('https');
const http = require('http');

class AuthFlowTester {
  constructor() {
    this.baseUrl = process.env.VITE_API_BASE || 'http://localhost:8003';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.testResults = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              parseError: e.message
            });
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
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

  // Backend API Tests
  async testBackendHealth() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/health`);
      const passed = response.status === 200 && response.data.status === 'healthy';
      this.logTest('Backend Health Check', passed, { response: response.data });
    } catch (error) {
      this.logTest('Backend Health Check', false, { error: error.message });
    }
  }

  async testContentTypesAPI() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/content-types`);
      const passed = response.status === 200 && 
                   response.data.all_sources && 
                   response.data.blogs && 
                   response.data.events && 
                   response.data.learn;
      this.logTest('Content Types API', passed, { response: response.data });
    } catch (error) {
      this.logTest('Content Types API', false, { error: error.message });
    }
  }

  async testDigestAPI() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/digest`);
      const passed = response.status === 200 && 
                   response.data.summary && 
                   response.data.topStories && 
                   response.data.content;
      this.logTest('Digest API', passed, { response: response.data });
    } catch (error) {
      this.logTest('Digest API', false, { error: error.message });
    }
  }

  async testTopicsAPI() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/topics`);
      const passed = response.status === 200 && Array.isArray(response.data);
      this.logTest('Topics API', passed, { response: response.data });
    } catch (error) {
      this.logTest('Topics API', false, { error: error.message });
    }
  }

  // Authentication Tests
  async testSignUpPositiveFlow() {
    try {
      const testUser = {
        name: 'Test User',
        email: `test.${Date.now()}@example.com`,
        password: 'TestPassword123!'
      };

      const response = await this.makeRequest(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        body: testUser
      });

      const passed = response.status === 201 && 
                   response.data.user && 
                   response.data.token &&
                   response.data.user.email === testUser.email;
      
      this.logTest('Sign Up - Positive Flow', passed, { 
        response: response.data,
        testUser: { ...testUser, password: '[REDACTED]' }
      });

      // Store token for further tests
      if (passed) {
        this.testToken = response.data.token;
        this.testUserId = response.data.user.id;
      }
    } catch (error) {
      this.logTest('Sign Up - Positive Flow', false, { error: error.message });
    }
  }

  async testSignUpNegativeFlows() {
    const testCases = [
      {
        name: 'Missing Name',
        data: { email: 'test@example.com', password: 'TestPassword123!' },
        expectedStatus: 400
      },
      {
        name: 'Invalid Email',
        data: { name: 'Test', email: 'invalid-email', password: 'TestPassword123!' },
        expectedStatus: 400
      },
      {
        name: 'Short Password',
        data: { name: 'Test', email: 'test@example.com', password: '123' },
        expectedStatus: 400
      },
      {
        name: 'Empty Fields',
        data: {},
        expectedStatus: 400
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}/api/auth/signup`, {
          method: 'POST',
          body: testCase.data
        });

        const passed = response.status === testCase.expectedStatus && response.data.error;
        this.logTest(`Sign Up - ${testCase.name}`, passed, { 
          expected: testCase.expectedStatus,
          actual: response.status,
          error: response.data.error || response.data.message
        });
      } catch (error) {
        this.logTest(`Sign Up - ${testCase.name}`, false, { error: error.message });
      }
    }
  }

  async testSignInPositiveFlow() {
    try {
      // First create a user
      const testUser = {
        name: 'Login Test User',
        email: `login.test.${Date.now()}@example.com`,
        password: 'LoginTestPassword123!'
      };

      await this.makeRequest(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        body: testUser
      });

      // Now test login
      const response = await this.makeRequest(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        body: {
          email: testUser.email,
          password: testUser.password
        }
      });

      const passed = response.status === 200 && 
                   response.data.user && 
                   response.data.token &&
                   response.data.user.email === testUser.email;

      this.logTest('Sign In - Positive Flow', passed, { 
        response: response.data,
        testUser: { ...testUser, password: '[REDACTED]' }
      });
    } catch (error) {
      this.logTest('Sign In - Positive Flow', false, { error: error.message });
    }
  }

  async testSignInNegativeFlows() {
    const testCases = [
      {
        name: 'Invalid Email',
        data: { email: 'nonexistent@example.com', password: 'TestPassword123!' },
        expectedStatus: 401
      },
      {
        name: 'Wrong Password',
        data: { email: 'test@example.com', password: 'WrongPassword!' },
        expectedStatus: 401
      },
      {
        name: 'Missing Credentials',
        data: {},
        expectedStatus: 400
      },
      {
        name: 'Invalid Email Format',
        data: { email: 'invalid-email', password: 'TestPassword123!' },
        expectedStatus: 400
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          body: testCase.data
        });

        const passed = response.status === testCase.expectedStatus && response.data.error;
        this.logTest(`Sign In - ${testCase.name}`, passed, { 
          expected: testCase.expectedStatus,
          actual: response.status,
          error: response.data.error || response.data.message
        });
      } catch (error) {
        this.logTest(`Sign In - ${testCase.name}`, false, { error: error.message });
      }
    }
  }

  async testGoogleAuthFlow() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/auth/google`, {
        method: 'POST',
        body: { idToken: 'mock-google-token-12345' }
      });

      const passed = response.status === 200 && 
                   response.data.user && 
                   response.data.token;

      this.logTest('Google Auth - Positive Flow', passed, { response: response.data });

      // Test negative case
      const negativeResponse = await this.makeRequest(`${this.baseUrl}/auth/google`, {
        method: 'POST',
        body: {}
      });

      const negativePassed = negativeResponse.status === 400 && negativeResponse.data.error;
      this.logTest('Google Auth - Missing Token', negativePassed, { 
        response: negativeResponse.data 
      });
    } catch (error) {
      this.logTest('Google Auth Flow', false, { error: error.message });
    }
  }

  async testAuthenticatedEndpoints() {
    if (!this.testToken) {
      this.logTest('Authenticated Endpoints', false, { error: 'No test token available' });
      return;
    }

    try {
      // Test profile endpoint
      const profileResponse = await this.makeRequest(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.testToken}` }
      });

      const profilePassed = profileResponse.status === 200 && profileResponse.data.id;
      this.logTest('Profile Endpoint - Authenticated', profilePassed, { 
        response: profileResponse.data 
      });

      // Test preferences update
      const prefsResponse = await this.makeRequest(`${this.baseUrl}/api/auth/preferences`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.testToken}` },
        body: {
          topics: [{ id: 1, name: 'Machine Learning', selected: true }],
          notifications: true
        }
      });

      const prefsPassed = prefsResponse.status === 200;
      this.logTest('Preferences Update - Authenticated', prefsPassed, { 
        response: prefsResponse.data 
      });

    } catch (error) {
      this.logTest('Authenticated Endpoints', false, { error: error.message });
    }
  }

  async testContentFilteringEndpoints() {
    const contentTypes = ['blogs', 'podcasts', 'videos', 'events', 'learn'];
    
    for (const contentType of contentTypes) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}/api/digest/${contentType}`);
        const passed = response.status === 200 && 
                     response.data.content && 
                     response.data.content[contentType];
        
        this.logTest(`Content Filtering - ${contentType}`, passed, { 
          response: response.data 
        });
      } catch (error) {
        this.logTest(`Content Filtering - ${contentType}`, false, { error: error.message });
      }
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const successRate = ((this.passCount / this.testCount) * 100).toFixed(1);
    
    const report = {
      testSuite: 'AI News Digest - Authentication Flow Tests',
      timestamp,
      summary: {
        total: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        successRate: `${successRate}%`
      },
      configuration: {
        backendUrl: this.baseUrl,
        frontendUrl: this.frontendUrl
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.failCount > 0) {
      recommendations.push('Review failed test cases and fix underlying issues');
    }
    
    if (this.passCount === this.testCount) {
      recommendations.push('All tests passing - system ready for production');
    }
    
    const authTests = this.testResults.filter(t => t.name.includes('Auth') || t.name.includes('Sign'));
    const failedAuthTests = authTests.filter(t => !t.passed);
    
    if (failedAuthTests.length > 0) {
      recommendations.push('Critical authentication issues detected - fix before deployment');
    }

    return recommendations;
  }

  async runAllTests() {
    console.log('🚀 Starting AI News Digest Authentication Flow Tests\n');
    console.log(`Backend URL: ${this.baseUrl}`);
    console.log(`Frontend URL: ${this.frontendUrl}\n`);

    // Backend API Tests
    console.log('📡 Testing Backend APIs...');
    await this.testBackendHealth();
    await this.testContentTypesAPI();
    await this.testDigestAPI();
    await this.testTopicsAPI();
    console.log('');

    // Authentication Flow Tests
    console.log('🔐 Testing Authentication Flows...');
    await this.testSignUpPositiveFlow();
    await this.testSignUpNegativeFlows();
    await this.testSignInPositiveFlow();
    await this.testSignInNegativeFlows();
    await this.testGoogleAuthFlow();
    console.log('');

    // Authenticated Endpoint Tests
    console.log('🔒 Testing Authenticated Endpoints...');
    await this.testAuthenticatedEndpoints();
    console.log('');

    // Content Filtering Tests
    console.log('📋 Testing Content Filtering...');
    await this.testContentFilteringEndpoints();
    console.log('');

    // Generate and display report
    const report = this.generateReport();
    
    console.log('📊 Test Results Summary:');
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
    const fs = require('fs');
    const reportPath = `./test-reports/auth-flow-report-${Date.now()}.json`;
    
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
  const tester = new AuthFlowTester();
  tester.runAllTests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = AuthFlowTester;