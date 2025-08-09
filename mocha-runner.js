#!/usr/bin/env node

/**
 * MOCHA-BASED SECURITY TEST RUNNER
 * ================================
 * 
 * This is the new main entry point that orchestrates:
 * 1. Mocha test execution (better test organization)
 * 2. ZAP security scanning integration
 * 3. AI-powered vulnerability analysis
 * 4. Comprehensive report generation
 * 
 * Usage:
 * - npm run test:mocha (all tests)
 * - npm run test:mocha:auth (authentication tests only)
 * - npm run test:mocha:input (input validation tests only)
 * - npm run test:mocha:business (business logic tests only)
 */

const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const config = require('./config/config');
const ZAPClient = require('./src/zap-client');
const AIAnalyzer = require('./src/ai-analyzer');
const ReportGenerator = require('./src/report-generator');

class MochaSecurityTestRunner {
  constructor() {
    this.zapClient = new ZAPClient();
    this.aiAnalyzer = new AIAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.startTime = null;
    this.testFilter = null;
    this.results = {
      testResults: [],
      testSummary: { total: 0, passed: 0, failed: 0, duration: 0 },
      securitySummary: { totalAlerts: 0, high: 0, medium: 0, low: 0 },
      vulnerabilities: [],
      executiveSummary: null,
      overallRiskScore: 0,
      scanDuration: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = chalk.blue('[MOCHA-RUNNER]');
    
    switch (type) {
      case 'error':
        console.log(`${prefix} ${chalk.red('ERROR')} ${timestamp}: ${message}`);
        break;
      case 'warn':
        console.log(`${prefix} ${chalk.yellow('WARN')} ${timestamp}: ${message}`);
        break;
      case 'success':
        console.log(`${prefix} ${chalk.green('SUCCESS')} ${timestamp}: ${message}`);
        break;
      default:
        console.log(`${prefix} ${chalk.white('INFO')} ${timestamp}: ${message}`);
    }
  }

  async initialize() {
    this.log('Initializing Mocha-based security testing framework...', 'info');
    
    try {
      // Initialize ZAP client
      const zapInit = await this.zapClient.initialize();
      if (!zapInit) {
        throw new Error('ZAP initialization failed');
      }
      this.log('ZAP client initialized successfully', 'success');
      
      // Initialize AI analyzer
      if (config.ai.enabled) {
        const aiInit = await this.aiAnalyzer.initialize();
        if (!aiInit) {
          this.log('AI analyzer initialization failed, continuing without AI...', 'warn');
        } else {
          this.log('AI analyzer initialized successfully', 'success');
        }
      }
      
      // Initialize report generator
      const reportInit = await this.reportGenerator.initialize();
      if (!reportInit) {
        this.log('Report generator initialization failed', 'warn');
      }
      
      return true;
    } catch (error) {
      this.log(`Framework initialization failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runMochaTests() {
    return new Promise((resolve, reject) => {
      this.log('Starting Mocha test execution...', 'info');
      
      const mochaArgs = [
        '--config', '.mocharc.json'
      ];
      
      // Add test filter if specified
      if (this.testFilter) {
        mochaArgs.push('--grep', this.testFilter);
      }
      
      const spinner = ora('Running security tests...').start();
      
      const mochaProcess = spawn('npx', ['mocha', ...mochaArgs], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let output = '';
      let errorOutput = '';
      
      mochaProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        // Show live output
        console.log(chunk);
      });
      
      mochaProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      mochaProcess.on('close', (code) => {
        spinner.stop();
        
        if (code === 0) {
          this.log('Mocha tests completed successfully', 'success');
          resolve({ success: true, output, code });
        } else {
          this.log(`Mocha tests completed with exit code: ${code}`, 'warn');
          resolve({ success: false, output, errorOutput, code });
        }
      });
      
      mochaProcess.on('error', (error) => {
        spinner.stop();
        this.log(`Mocha execution error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async runZAPScanning() {
    this.log('Starting ZAP security scanning...', 'info');
    
    try {
      const zapSpinner = ora('Running ZAP scans...').start();
      
      // Run spider scan if enabled
      if (config.zap.spider.enabled) {
        zapSpinner.text = 'Running ZAP spider scan...';
        const spiderId = await this.zapClient.startSpider(config.juiceShop.url);
        await this.zapClient.waitForSpiderCompletion(spiderId);
      }
      
      // Run active scan if enabled
      if (config.zap.activeScan.enabled) {
        zapSpinner.text = 'Running ZAP active scan...';
        const activeScanId = await this.zapClient.startActiveScan(config.juiceShop.url);
        await this.zapClient.waitForActiveScanCompletion(activeScanId);
      }
      
      zapSpinner.succeed('ZAP scanning completed');
      
      // Get security alerts
      const alerts = await this.zapClient.getAlerts();
      this.results.vulnerabilities = alerts;
      
      // Calculate security summary
      this.results.securitySummary = {
        totalAlerts: alerts.length,
        high: alerts.filter(a => a.risk === 'High').length,
        medium: alerts.filter(a => a.risk === 'Medium').length,
        low: alerts.filter(a => a.risk === 'Low').length
      };
      
      this.log(`Security scanning completed - Found ${alerts.length} vulnerabilities`, 'success');
      return true;
      
    } catch (error) {
      this.log(`ZAP scanning failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAIAnalysis() {
    if (!config.ai.enabled || this.results.vulnerabilities.length === 0) {
      this.log('Skipping AI analysis (disabled or no vulnerabilities found)', 'info');
      return true;
    }
    
    this.log('Starting AI-powered vulnerability analysis...', 'info');
    
    try {
      const aiSpinner = ora('Analyzing vulnerabilities with AI...').start();
      
      // Analyze vulnerabilities with AI
      const analysisResults = await this.aiAnalyzer.analyzeVulnerabilities(this.results.vulnerabilities);
      
      // Update vulnerabilities with AI insights
      this.results.vulnerabilities = analysisResults.vulnerabilities;
      this.results.overallRiskScore = analysisResults.overallRiskScore;
      this.results.falsePositives = analysisResults.falsePositives;
      
      // Generate executive summary
      aiSpinner.text = 'Generating executive summary...';
      this.results.executiveSummary = await this.aiAnalyzer.generateExecutiveSummary(
        this.results.vulnerabilities,
        this.results.securitySummary
      );
      
      aiSpinner.succeed('AI analysis completed');
      this.log('AI analysis completed successfully', 'success');
      return true;
      
    } catch (error) {
      this.log(`AI analysis failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReports() {
    this.log('Generating comprehensive security reports...', 'info');
    
    try {
      const reportSpinner = ora('Generating reports...').start();
      
      // Parse Mocha test results from JSON report
      try {
        const mochaReportPath = path.join(process.cwd(), 'reports', 'test-results.json');
        if (await fs.pathExists(mochaReportPath)) {
          const mochaResults = await fs.readJson(mochaReportPath);
          this.results.testSummary = {
            total: mochaResults.stats.tests,
            passed: mochaResults.stats.passes,
            failed: mochaResults.stats.failures,
            duration: mochaResults.stats.duration
          };
        }
      } catch (error) {
        this.log('Could not parse Mocha results, using defaults', 'warn');
      }
      
      // Generate main security report
      const reportPath = await this.reportGenerator.generateReport(this.results);
      
      reportSpinner.succeed('Reports generated successfully');
      this.log(`Security report generated: ${reportPath}`, 'success');
      
      return reportPath;
      
    } catch (error) {
      this.log(`Report generation failed: ${error.message}`, 'error');
      return null;
    }
  }

  async run(testFilter = null) {
    this.startTime = Date.now();
    this.testFilter = testFilter;
    
    console.log(chalk.cyan.bold('🛡️  MOCHA-BASED SECURITY TESTING FRAMEWORK'));
    console.log(chalk.cyan('====================================='));
    console.log('');
    
    try {
      // Initialize framework
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error('Framework initialization failed');
      }
      
      // Run Mocha tests (generates HTTP traffic for ZAP)
      const testResults = await this.runMochaTests();
      
      // Run ZAP security scanning
      const zapSuccess = await this.runZAPScanning();
      if (!zapSuccess) {
        this.log('ZAP scanning failed, continuing with test results only...', 'warn');
      }
      
      // Run AI analysis
      const aiSuccess = await this.runAIAnalysis();
      if (!aiSuccess) {
        this.log('AI analysis failed, continuing without AI enhancements...', 'warn');
      }
      
      // Generate reports
      const reportPath = await this.generateReports();
      
      // Display summary
      const totalDuration = Date.now() - this.startTime;
      this.results.scanDuration = totalDuration;
      
      console.log('');
      console.log(chalk.green.bold('📊 SECURITY ASSESSMENT SUMMARY'));
      console.log(chalk.green('================================'));
      console.log(`📅 Assessment Date: ${new Date().toLocaleString()}`);
      console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
      console.log(`🧪 Test Results: ${this.results.testSummary.passed}/${this.results.testSummary.total} passed`);
      console.log(`🔍 Security Findings: ${this.results.securitySummary.totalAlerts} total`);
      console.log(`   ├─ High Risk: ${this.results.securitySummary.high}`);
      console.log(`   ├─ Medium Risk: ${this.results.securitySummary.medium}`);
      console.log(`   └─ Low Risk: ${this.results.securitySummary.low}`);
      console.log(`📊 Overall Risk Score: ${this.results.overallRiskScore}/10`);
      console.log(`🤖 AI Enhanced: ${config.ai.enabled ? 'Yes' : 'No'}`);
      
      if (reportPath) {
        console.log(`📄 Report: ${reportPath}`);
      }
      
      return true;
      
    } catch (error) {
      this.log(`Security assessment failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
let testFilter = null;

// Parse arguments
args.forEach(arg => {
  if (arg.startsWith('--filter=')) {
    testFilter = arg.split('=')[1];
  }
});

// Run the assessment
if (require.main === module) {
  const runner = new MochaSecurityTestRunner();
  runner.run(testFilter).then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MochaSecurityTestRunner;
