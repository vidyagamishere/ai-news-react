#!/usr/bin/env node

/**
 * AI News Digest - Complete Test Suite Runner
 * Orchestrates all tests and generates comprehensive reports
 */

const AuthFlowTester = require('./auth-flow-test.cjs');
const FrontendE2ETester = require('./frontend-e2e-test.cjs');
const fs = require('fs');

class MasterTestRunner {
  constructor() {
    this.results = {
      authFlow: null,
      frontendE2E: null,
      overall: {
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        overallSuccessRate: '0%'
      }
    };
  }

  async runAuthFlowTests() {
    console.log('🔐 Running Authentication Flow Tests...\n');
    const authTester = new AuthFlowTester();
    this.results.authFlow = await authTester.runAllTests();
    console.log('✅ Authentication Flow Tests Complete\n');
  }

  async runFrontendE2ETests() {
    console.log('🎭 Running Frontend E2E Tests...\n');
    const frontendTester = new FrontendE2ETester();
    this.results.frontendE2E = await frontendTester.runAllTests();
    console.log('✅ Frontend E2E Tests Complete\n');
  }

  calculateOverallResults() {
    const authResults = this.results.authFlow?.summary || { total: 0, passed: 0, failed: 0 };
    const frontendResults = this.results.frontendE2E?.summary || { total: 0, passed: 0, failed: 0 };
    
    this.results.overall.endTime = new Date().toISOString();
    this.results.overall.duration = new Date() - new Date(this.results.overall.startTime);
    this.results.overall.totalTests = authResults.total + frontendResults.total;
    this.results.overall.totalPassed = authResults.passed + frontendResults.passed;
    this.results.overall.totalFailed = authResults.failed + frontendResults.failed;
    
    if (this.results.overall.totalTests > 0) {
      this.results.overall.overallSuccessRate = 
        ((this.results.overall.totalPassed / this.results.overall.totalTests) * 100).toFixed(1) + '%';
    }
  }

  generateMasterReport() {
    const report = {
      testSuite: 'AI News Digest - Complete Test Suite',
      timestamp: new Date().toISOString(),
      configuration: {
        backendUrl: process.env.VITE_API_BASE || 'http://localhost:8003',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
      },
      overall: this.results.overall,
      authFlowResults: this.results.authFlow,
      frontendE2EResults: this.results.frontendE2E,
      criticalIssues: this.identifyCriticalIssues(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  identifyCriticalIssues() {
    const issues = [];
    
    // Check auth flow issues
    if (this.results.authFlow) {
      const failedAuthTests = this.results.authFlow.results.filter(t => 
        !t.passed && (t.name.includes('Sign Up - Positive') || t.name.includes('Sign In - Positive'))
      );
      
      if (failedAuthTests.length > 0) {
        issues.push({
          severity: 'CRITICAL',
          area: 'Authentication',
          description: 'Basic authentication flows are failing',
          impact: 'Users cannot register or login to the application'
        });
      }
    }

    // Check frontend issues
    if (this.results.frontendE2E) {
      const failedNavTests = this.results.frontendE2E.results.filter(t => 
        !t.passed && t.name.includes('Navigation')
      );
      
      if (failedNavTests.length > 0) {
        issues.push({
          severity: 'HIGH',
          area: 'Frontend Navigation',
          description: 'Page navigation is not working correctly',
          impact: 'Users cannot navigate between authentication pages'
        });
      }
    }

    return issues;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const overallFailRate = (this.results.overall.totalFailed / this.results.overall.totalTests) * 100;
    
    if (overallFailRate === 0) {
      recommendations.push('🎉 All tests passing! System is ready for production deployment.');
    } else if (overallFailRate < 10) {
      recommendations.push('✅ System is mostly stable with minor issues to address.');
    } else if (overallFailRate < 25) {
      recommendations.push('⚠️  Several issues detected. Review and fix before production.');
    } else {
      recommendations.push('🚨 Major issues detected. Significant fixes required before deployment.');
    }

    const criticalIssues = this.identifyCriticalIssues();
    if (criticalIssues.length > 0) {
      recommendations.push('🔥 CRITICAL: Authentication system has failures - immediate attention required.');
    }

    return recommendations;
  }

  async runAllTests() {
    console.log('🚀 AI News Digest - Complete Test Suite\n');
    console.log('=' .repeat(60));
    console.log('Testing all authentication flows and frontend functionality\n');

    try {
      // Run all test suites
      await this.runAuthFlowTests();
      await this.runFrontendE2ETests();
      
      // Calculate overall results
      this.calculateOverallResults();
      
      // Generate master report
      const report = this.generateMasterReport();
      
      // Display summary
      console.log('=' .repeat(60));
      console.log('🏁 COMPLETE TEST SUITE RESULTS');
      console.log('=' .repeat(60));
      console.log(`⏱️  Duration: ${Math.round(this.results.overall.duration / 1000)}s`);
      console.log(`📊 Total Tests: ${this.results.overall.totalTests}`);
      console.log(`✅ Passed: ${this.results.overall.totalPassed}`);
      console.log(`❌ Failed: ${this.results.overall.totalFailed}`);
      console.log(`📈 Success Rate: ${this.results.overall.overallSuccessRate}`);
      console.log('');

      // Show critical issues
      if (report.criticalIssues.length > 0) {
        console.log('🚨 CRITICAL ISSUES:');
        report.criticalIssues.forEach(issue => {
          console.log(`   ${issue.severity}: ${issue.description}`);
          console.log(`   Impact: ${issue.impact}`);
        });
        console.log('');
      }

      // Show recommendations
      console.log('💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
      console.log('');

      // Save master report
      const reportPath = `./test-reports/master-test-report-${Date.now()}.json`;
      
      try {
        if (!fs.existsSync('./test-reports')) {
          fs.mkdirSync('./test-reports', { recursive: true });
        }
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Master report saved to: ${reportPath}`);
      } catch (error) {
        console.log(`⚠️  Could not save master report: ${error.message}`);
      }

      return report;
      
    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      throw error;
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const runner = new MasterTestRunner();
  runner.runAllTests()
    .then(report => {
      const exitCode = report.overall.totalFailed > 0 ? 1 : 0;
      console.log(`\n🏁 Test suite completed with exit code: ${exitCode}`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Master test runner failed:', error);
      process.exit(1);
    });
}

module.exports = MasterTestRunner;