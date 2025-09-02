#!/usr/bin/env node

/**
 * Google OAuth Flow Test
 * Tests Google authentication integration
 */

const https = require('https');

class GoogleAuthTester {
  constructor() {
    this.baseUrl = process.env.VITE_API_BASE || 'https://ai-news-scraper.vercel.app';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://ai-news-react.vercel.app';
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
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

  async testGoogleAuthEndpoint() {
    console.log('🔍 Testing Google Auth Endpoint...');
    
    try {
      // Test with valid format mock token
      const response = await this.makeRequest(`${this.baseUrl}/api/auth/google`, {
        method: 'POST',
        body: { idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjExZTI0OWM0ODZlOWE1OWUxYWE5OGNlOGJjZWE5YjEwOTVhNzY3NjEiLCJ0eXAiOiJKV1QifQ.mock-token-for-testing' }
      });

      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      if (response.status === 200 && response.data.user && response.data.token) {
        console.log('✅ Google Auth endpoint working correctly');
        return true;
      } else {
        console.log('❌ Google Auth endpoint response invalid');
        return false;
      }
    } catch (error) {
      console.log('❌ Google Auth endpoint failed:', error.message);
      return false;
    }
  }

  async testGoogleAuthFlow() {
    console.log('🔑 Testing Google Auth Flow...');
    
    // Test positive case
    const positiveResult = await this.testGoogleAuthEndpoint();
    
    // Test negative case - missing token
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/auth/google`, {
        method: 'POST',
        body: {}
      });
      
      console.log('\n🚫 Testing invalid request (no token):');
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      if (response.status >= 400) {
        console.log('✅ Properly rejects invalid requests');
      } else {
        console.log('❌ Should reject invalid requests');
      }
    } catch (error) {
      console.log('Error testing negative case:', error.message);
    }
    
    return positiveResult;
  }

  async testFrontendConfiguration() {
    console.log('\n🌐 Testing Frontend Configuration...');
    
    try {
      const response = await this.makeRequest(this.frontendUrl);
      
      if (response.status === 200) {
        console.log('✅ Frontend accessible');
        console.log(`Frontend URL: ${this.frontendUrl}`);
        return true;
      } else {
        console.log('❌ Frontend not accessible');
        return false;
      }
    } catch (error) {
      console.log('❌ Frontend test failed:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Google OAuth Integration Tests\n');
    console.log(`Backend URL: ${this.baseUrl}`);
    console.log(`Frontend URL: ${this.frontendUrl}\n`);
    
    const results = {
      authEndpoint: await this.testGoogleAuthFlow(),
      frontend: await this.testFrontendConfiguration()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Google Auth Endpoint: ${results.authEndpoint ? '✅ Working' : '❌ Failed'}`);
    console.log(`Frontend Access: ${results.frontend ? '✅ Working' : '❌ Failed'}`);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\nOverall Status: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
    
    if (allPassed) {
      console.log('\n💡 Google OAuth is ready for testing!');
      console.log('Next steps:');
      console.log('1. Visit the frontend URL');
      console.log('2. Click "Continue with Google"');
      console.log('3. Complete Google sign-in flow');
      console.log('4. Verify successful authentication');
    }
    
    return allPassed;
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new GoogleAuthTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = GoogleAuthTester;