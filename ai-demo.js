#!/usr/bin/env node

/**
 * Quick Test with Real AI Analysis - No external dependencies needed
 * This will run the framework with simulated vulnerability data but REAL AI analysis
 */

require('dotenv').config();
const chalk = require('chalk');
const TestRunner = require('./src/test-runner');

async function quickAIDemo() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🤖 REAL AI ANALYSIS DEMO - GROQ Powered                     ║
║                                                                  ║
║     Testing the AI analyzer with real GROQ API calls            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `));

  const AIAnalyzer = require('./src/ai-analyzer');
  const ReportGenerator = require('./src/report-generator');
  
  const aiAnalyzer = new AIAnalyzer();
  const reportGenerator = new ReportGenerator();
  
  await reportGenerator.initialize();
  
  // Test AI capabilities
  console.log(chalk.blue('🧠 Testing AI Capabilities...'));
  const capabilities = await aiAnalyzer.getAICapabilities();
  console.log(chalk.green(`✅ AI Enabled: ${capabilities.enabled}`));
  console.log(chalk.green(`✅ Provider: ${capabilities.provider}`));
  console.log(chalk.green(`✅ Model: ${aiAnalyzer.model}`));

  // Simulate some real vulnerabilities for AI analysis
  const mockVulnerabilities = [
    {
      alert: 'SQL Injection',
      risk: 'High',
      description: 'SQL Injection vulnerability detected in user login form',
      url: 'http://localhost:3000/rest/user/login',
      param: 'email',
      evidence: "SELECT * FROM Users WHERE email = 'admin@juice-sh.op' OR '1'='1' --' AND password = 'password'",
      solution: 'Use parameterized queries to prevent SQL injection attacks',
      reference: 'https://owasp.org/www-community/attacks/SQL_Injection'
    },
    {
      alert: 'Cross-Site Scripting (XSS)',
      risk: 'Medium', 
      description: 'Reflected XSS vulnerability in product search',
      url: 'http://localhost:3000/rest/products/search?q=<script>alert(1)</script>',
      param: 'q',
      evidence: '<script>alert("XSS Test")</script>',
      solution: 'Implement proper input validation and output encoding',
      reference: 'https://owasp.org/www-community/attacks/xss/'
    }
  ];

  console.log(chalk.blue(`\n🔍 Analyzing ${mockVulnerabilities.length} vulnerabilities with GROQ AI...`));
  
  // Run REAL AI analysis on the mock vulnerabilities
  const analyzedVulnerabilities = await aiAnalyzer.analyzeVulnerabilities(mockVulnerabilities);
  
  // Generate executive summary with AI
  const executiveSummary = await aiAnalyzer.generateExecutiveSummary({
    vulnerabilities: analyzedVulnerabilities,
    testSummary: { total: 5, passed: 4, failed: 1 },
    securitySummary: { totalAlerts: 2, high: 1, medium: 1, low: 0 }
  });

  // Calculate AI risk score
  const riskScore = await aiAnalyzer.calculateRiskScore(analyzedVulnerabilities);

  // Show AI analysis results
  console.log(chalk.green('\n🤖 AI ANALYSIS RESULTS'));
  console.log(chalk.white('═'.repeat(50)));
  
  analyzedVulnerabilities.forEach((vuln, index) => {
    console.log(chalk.cyan(`\n📋 Vulnerability ${index + 1}: ${vuln.alert}`));
    if (vuln.aiAnalysis) {
      console.log(chalk.yellow(`   Business Impact: ${vuln.aiAnalysis.businessImpact?.substring(0, 100)}...`));
      console.log(chalk.yellow(`   Risk Score: ${vuln.aiAnalysis.businessRiskScore}/10`));
      console.log(chalk.yellow(`   False Positive: ${vuln.aiAnalysis.falsePositiveScore}%`));
    } else {
      console.log(chalk.red(`   ❌ AI Analysis Failed`));
    }
  });

  if (executiveSummary && executiveSummary.summary) {
    console.log(chalk.green('\n👔 EXECUTIVE SUMMARY'));
    console.log(chalk.white('═'.repeat(30)));
    console.log(chalk.cyan(executiveSummary.summary.substring(0, 300) + '...'));
  }

  console.log(chalk.green(`\n📊 Overall AI Risk Score: ${riskScore}/10`));

  // Generate full report with AI analysis
  const reportData = {
    reportTitle: 'Real AI Analysis Demo Report',
    timestamp: new Date().toISOString(),
    aiEnabled: true,
    testSummary: { total: 5, passed: 4, failed: 1, duration: 30000 },
    testResults: [
      { scenario: 'Login Test', status: 'PASS', timestamp: new Date().toISOString(), duration: 8000 },
      { scenario: 'Search Test', status: 'FAIL', timestamp: new Date().toISOString(), duration: 5000 }
    ],
    securitySummary: { totalAlerts: 2, high: 1, medium: 1, low: 0 },
    vulnerabilities: analyzedVulnerabilities,
    executiveSummary: executiveSummary,
    overallRiskScore: riskScore,
    falsePositives: [],
    scanDuration: 120
  };

  const reportPaths = await reportGenerator.generateReport(reportData);
  
  console.log(chalk.green('\n✅ Real AI Report Generated!'));
  console.log(chalk.cyan(`📄 Report: ${reportPaths.htmlPath}`));

  // Open the report
  const { exec } = require('child_process');
  exec(`open "${reportPaths.htmlPath}"`, (error) => {
    if (error) {
      console.log(chalk.yellow(`💡 Manually open: ${reportPaths.htmlPath}`));
    } else {
      console.log(chalk.green('🌐 AI-Enhanced Report opened in browser'));
    }
  });

  console.log(chalk.cyan('\n🎯 This demonstrates REAL AI analysis using GROQ!'));
  console.log(chalk.yellow('🚀 The vulnerabilities were analyzed by AI and enhanced with:'));
  console.log('   • Business impact assessment');
  console.log('   • False positive likelihood');  
  console.log('   • Risk scoring');
  console.log('   • Executive summaries');
  console.log('   • Remediation recommendations');
}

quickAIDemo().catch(error => {
  console.error(chalk.red('AI Demo failed:'), error);
  process.exit(1);
});
