#!/usr/bin/env node

/**
 * Demo Mode - Test the framework without external dependencies
 * This will simulate the framework execution for demonstration purposes
 */

require('dotenv').config();
const chalk = require('chalk');
const fs = require('fs-extra');

async function runDemo() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🎬  DEMO MODE - AI Security Framework Simulation             ║
║                                                                  ║
║     This demo shows the framework capabilities without           ║
║     requiring Juice Shop or ZAP to be running                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `));

  // Test AI connectivity
  console.log(chalk.blue('🤖 Testing GROQ AI Integration...'));
  
  try {
    const OpenAI = require('openai');
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    console.log(chalk.green('✅ GROQ client initialized successfully'));
    console.log(chalk.yellow('📝 Testing a simple AI request...'));

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: 'Explain what SQL injection is in one sentence for a security report.'
        }
      ],
      max_tokens: 100
    });

    const aiResponse = response.choices[0]?.message?.content || 'No response';
    console.log(chalk.green('🤖 GROQ AI Response:'), chalk.white(aiResponse));

  } catch (error) {
    console.log(chalk.red('❌ GROQ AI Test Failed:'), error.message);
    if (error.message.includes('API key')) {
      console.log(chalk.yellow('💡 Please check your GROQ API key in .env file'));
    }
  }

  // Create mock report data
  console.log(chalk.blue('\n📊 Generating Sample Security Report...'));
  
  const mockData = {
    reportTitle: 'AI-Enhanced Security Assessment (DEMO)',
    timestamp: new Date().toISOString(),
    aiEnabled: true,
    testSummary: { 
      total: 5, 
      passed: 4, 
      failed: 1, 
      duration: 45000 
    },
    testResults: [
      { scenario: 'Login Test', status: 'PASS', timestamp: new Date().toISOString(), duration: 8000 },
      { scenario: 'Registration Test', status: 'PASS', timestamp: new Date().toISOString(), duration: 12000 },
      { scenario: 'Product Search Test', status: 'PASS', timestamp: new Date().toISOString(), duration: 15000 },
      { scenario: 'Cart Operations Test', status: 'FAIL', timestamp: new Date().toISOString(), duration: 7000 },
      { scenario: 'Admin Access Test', status: 'PASS', timestamp: new Date().toISOString(), duration: 3000 }
    ],
    securitySummary: { 
      totalAlerts: 12, 
      high: 3, 
      medium: 5, 
      low: 4, 
      informational: 0 
    },
    vulnerabilities: [
      {
        alert: 'SQL Injection',
        risk: 'High',
        description: 'SQL Injection vulnerability detected in search parameter',
        url: 'http://localhost:3000/rest/products/search',
        param: 'q',
        evidence: 'SELECT * FROM Products WHERE name LIKE \'%<script>alert("XSS")</script>%\'',
        solution: 'Use parameterized queries to prevent SQL injection',
        reference: 'https://owasp.org/www-community/attacks/SQL_Injection',
        aiAnalysis: {
          businessImpact: 'CRITICAL - This vulnerability allows attackers to access the entire product database and potentially user credentials, leading to data breaches and financial losses estimated at $500K+.',
          technicalSeverity: 'High - Remote code execution possible through SQL injection with potential for complete database compromise',
          exploitationLikelihood: 'High - SQL injection exploits are widely available and this endpoint accepts user input directly',
          falsePositiveScore: '15',
          remediationSteps: '1. Implement parameterized queries 2. Add input validation 3. Enable SQL query logging 4. Implement Web Application Firewall rules',
          businessRiskScore: '9.2'
        }
      },
      {
        alert: 'Cross-Site Scripting (XSS)',
        risk: 'Medium', 
        description: 'Reflected XSS vulnerability in search functionality',
        url: 'http://localhost:3000/rest/products/search',
        param: 'q',
        evidence: '<script>alert("XSS")</script>',
        solution: 'Implement proper input validation and output encoding',
        reference: 'https://owasp.org/www-community/attacks/xss/',
        aiAnalysis: {
          businessImpact: 'MEDIUM - XSS attacks can lead to session hijacking, defacement, and phishing attacks affecting user trust and brand reputation.',
          technicalSeverity: 'Medium - Client-side code execution with potential for session theft',
          exploitationLikelihood: 'Medium - Requires user interaction but payloads are easily crafted',
          falsePositiveScore: '25',
          remediationSteps: '1. Implement Content Security Policy 2. Use proper output encoding 3. Validate and sanitize all user inputs',
          businessRiskScore: '6.8'
        }
      },
      {
        alert: 'Insecure Direct Object Reference',
        risk: 'High',
        description: 'Users can access other users\' data by modifying object references',
        url: 'http://localhost:3000/api/users/1',
        param: 'id',
        evidence: 'User ID parameter directly accessible without authorization check',
        solution: 'Implement proper access controls and authorization checks',
        reference: 'https://owasp.org/www-community/attacks/Insecure_Direct_Object_Reference',
        aiAnalysis: {
          businessImpact: 'HIGH - Direct access to user data violates privacy regulations (GDPR, CCPA) and could result in regulatory fines and loss of customer trust.',
          technicalSeverity: 'High - Unauthorized access to sensitive user information',
          exploitationLikelihood: 'High - Simple parameter manipulation required',
          falsePositiveScore: '5',
          remediationSteps: '1. Implement role-based access controls 2. Use indirect object references 3. Add authorization middleware',
          businessRiskScore: '8.5'
        }
      }
    ],
    executiveSummary: {
      overallPosture: 'The application shows significant security vulnerabilities that require immediate attention. While basic functionality works, critical security controls are missing.',
      keyRisks: 'Primary risks include SQL injection allowing database compromise, XSS enabling client-side attacks, and direct object reference vulnerabilities exposing user data.',
      businessImpact: 'Estimated potential business impact ranges from $500K to $2M in damages, regulatory fines, and reputation loss if vulnerabilities are exploited.',
      immediateActions: 'Priority 1: Fix SQL injection vulnerabilities. Priority 2: Implement proper access controls. Priority 3: Deploy Web Application Firewall.',
      recommendations: 'Implement secure development lifecycle, conduct regular security training, and establish continuous security monitoring.'
    },
    overallRiskScore: 7.8,
    falsePositives: [],
    scanDuration: 180
  };

  // Generate the demo report
  const ReportGenerator = require('./src/report-generator');
  const reportGenerator = new ReportGenerator();
  await reportGenerator.initialize();
  
  try {
    const reportPaths = await reportGenerator.generateReport(mockData);
    
    console.log(chalk.green('\n✅ Demo Report Generated Successfully!'));
    console.log(chalk.cyan(`📄 Demo Report: ${reportPaths.htmlPath}`));
    
    // Show summary
    console.log(chalk.blue('\n📊 DEMO SECURITY ASSESSMENT SUMMARY'));
    console.log(chalk.white('═'.repeat(50)));
    console.log(chalk.cyan(`🎭 Test Results: ${mockData.testSummary.passed}/${mockData.testSummary.total} passed`));
    console.log(chalk.cyan(`🔍 Security Findings: ${mockData.securitySummary.totalAlerts} total`));
    console.log(chalk.red(`   ├─ High Risk: ${mockData.securitySummary.high}`));
    console.log(chalk.yellow(`   ├─ Medium Risk: ${mockData.securitySummary.medium}`));
    console.log(chalk.blue(`   └─ Low Risk: ${mockData.securitySummary.low}`));
    console.log(chalk.cyan(`📊 Overall Risk Score: ${mockData.overallRiskScore}/10`));
    console.log(chalk.cyan(`🤖 AI Enhanced: Demo mode with GROQ Llama3 analysis`));
    console.log(chalk.white('═'.repeat(50)));

    // Open the report
    const { exec } = require('child_process');
    exec(`open "${reportPaths.htmlPath}"`, (error) => {
      if (error) {
        console.log(chalk.yellow(`💡 Manually open: ${reportPaths.htmlPath}`));
      } else {
        console.log(chalk.green('🌐 Report opened in browser'));
      }
    });

  } catch (error) {
    console.error(chalk.red('Report generation failed:'), error.message);
  }

  console.log(chalk.cyan('\n🎬 Demo completed! This shows what the full framework would generate.'));
  console.log(chalk.yellow('📝 To run the full assessment:'));
  console.log('   1. Start Docker Desktop');
  console.log('   2. Run: docker run --rm -p 3000:3000 bkimminich/juice-shop');
  console.log('   3. Start OWASP ZAP on port 8080');
  console.log('   4. Run: npm test');
}

runDemo().catch(error => {
  console.error(chalk.red('Demo failed:'), error);
  process.exit(1);
});
