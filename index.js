#!/usr/bin/env node

/**
 * AI-Enhanced Security Test Framework for OWASP Juice Shop
 * 
 * This framework integrates Playwright, OWASP ZAP, and OpenAI to provide
 * comprehensive security testing with intelligent vulnerability analysis.
 * 
 * Features:
 * - Automated browser testing with Playwright
 * - Security scanning with OWASP ZAP
 * - AI-powered vulnerability analysis
 * - Executive-friendly reporting
 * - False positive detection
 * - Business impact assessment
 */

require('dotenv').config();
const TestRunner = require('./src/test-runner');
const chalk = require('chalk');

async function main() {
  const args = process.argv.slice(2);
  const isQuickTest = args.includes('--quick') || args.includes('-q');
  const isDev = args.includes('--dev') || args.includes('-d');
  
  // Set development mode
  if (isDev) {
    process.env.NODE_ENV = 'development';
  }

  const runner = new TestRunner();

  try {
    console.log(chalk.blue('🚀 Starting AI-Enhanced Security Assessment Framework\n'));

    if (isQuickTest) {
      console.log(chalk.yellow('⚡ Running in QUICK TEST mode (tests only, no security scan)\n'));
      const success = await runner.quickTest();
      process.exit(success ? 0 : 1);
    } else {
      console.log(chalk.green('🔄 Running FULL SECURITY ASSESSMENT\n'));
      const result = await runner.run();
      
      if (result.success) {
        console.log(chalk.green(`\n✅ Assessment completed successfully in ${result.duration}s`));
        
        if (result.reportPaths) {
          console.log(chalk.cyan(`\n📊 Open your report: ${result.reportPaths.htmlPath}`));
        }
        
        process.exit(0);
      } else {
        console.log(chalk.red(`\n❌ Assessment failed: ${result.error}`));
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(chalk.red(`\n💥 Fatal error: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Received SIGINT. Gracefully shutting down...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️  Received SIGTERM. Gracefully shutting down...'));
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.cyan(`
AI-Enhanced Security Test Framework for OWASP Juice Shop

Usage: npm test [options]

Options:
  --quick, -q     Run quick test mode (tests only, no security scan)
  --dev, -d       Run in development mode with verbose logging
  --help, -h      Show this help message

Prerequisites:
  - OWASP Juice Shop running on localhost:3000
  - OWASP ZAP running on localhost:8080 with API enabled
  - OpenAI API key in .env file (for AI features)

Examples:
  npm test                    # Full security assessment
  npm test -- --quick         # Quick test mode
  npm test -- --dev           # Development mode with verbose logging

Report Location:
  HTML reports are saved to ./reports/ directory

For more information, see README.md
  `));
  process.exit(0);
}

// Run the main function
main();
