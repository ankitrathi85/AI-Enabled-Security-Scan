#!/usr/bin/env node

/**
 * FRAMEWORK SETUP VERIFICATION SCRIPT
 * ===================================
 * 
 * This script performs comprehensive verification of the AI-Enhanced Security Testing Framework:
 * 1. Configuration validation (URLs, proxy settings, AI provider)
 * 2. Dependency verification (required Node.js packages)
 * 3. Environment variable validation (API keys, settings)
 * 4. Connectivity testing (Juice Shop, ZAP API)
 * 
 * Run this script before executing the main framework to ensure proper setup.
 * 
 * Usage: node test-setup.js
 */

const chalk = require('chalk');
const config = require('./config/config');

/**
 * Main setup verification function
 * Orchestrates all verification steps and provides setup guidance
 */
async function runSetupVerification() {
  console.log(chalk.cyan('🧪 Testing Framework Setup...\n'));

  // Verify configuration settings
  displayConfigurationStatus();
  
  // Test required dependencies
  testDependencies();
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Test external service connectivity
  await testConnectivity();
}

/**
 * Display current configuration status
 * Shows key configuration values loaded from config.js
 */
function displayConfigurationStatus() {
  console.log(chalk.blue('📋 Configuration Test:'));
  console.log(`   Juice Shop URL: ${config.juiceShop.url}`);
  console.log(`   ZAP Proxy: ${config.zap.proxy.host}:${config.zap.proxy.port}`);
  console.log(`   AI Enabled: ${config.ai.enabled ? '✅ Yes' : '❌ No'}`);
  console.log(`   AI Provider: ${config.ai.provider}`);
}

/**
 * Test all required Node.js dependencies
 * Verifies that essential packages are installed and accessible
 */
function testDependencies() {
  console.log(chalk.blue('\n📦 Dependencies Test:'));

  // Test Playwright - Browser automation framework
  testDependency('playwright', 'Browser automation framework');
  
  // Test Axios - HTTP client for API requests
  testDependency('axios', 'HTTP client for API communication');
  
  // Test Handlebars - Template engine for report generation
  testDependency('handlebars', 'Template engine for reports');
  
  // Test OpenAI - AI API client library
  testDependency('openai', 'AI API client library');
}

/**
 * Test individual dependency availability
 * @param {string} packageName - Name of the npm package to test
 * @param {string} description - Human-readable description of the package
 */
function testDependency(packageName, description) {
  try {
    require(packageName);
    console.log(`   ✅ ${packageName} (${description})`);
  } catch (error) {
    console.log(`   ❌ ${packageName} (${description}) - ${error.message}`);
  }
}

/**
 * Check critical environment variables
 * Validates API keys and other environment-specific settings
 */
function checkEnvironmentVariables() {
  console.log(chalk.blue('\n🔑 Environment Test:'));
  console.log(`   Node.js: ${process.version}`);
  
  // Check AI provider API keys based on current provider
  checkAIProviderKeys();
  
  // Check other critical environment variables
  checkOptionalEnvironmentVars();
}

/**
 * Check AI provider API keys based on current configuration
 * Validates that the appropriate API key is set for the selected provider
 */
function checkAIProviderKeys() {
  const provider = config.ai.provider;
  
  switch (provider) {
    case 'openai':
      console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
      break;
    case 'groq':
      console.log(`   GROQ API Key: ${process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing'}`);
      break;
    case 'anthropic':
      console.log(`   Anthropic API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`);
      break;
    case 'ollama':
      console.log(`   Ollama: Local LLM (No API key required) ✅`);
      break;
    default:
      console.log(`   Unknown AI Provider: ${provider} ❌`);
  }
}

/**
 * Check optional environment variables
 * Validates additional configuration that may impact functionality
 */
function checkOptionalEnvironmentVars() {
  console.log(`   ZAP API Key: ${process.env.ZAP_API_KEY ? '✅ Set (Recommended)' : '⚠️  Optional (ZAP security)'}`);
  console.log(`   AI Enabled: ${config.ai.enabled ? '✅ Enabled' : '⚠️  Disabled'}`);
}

// Test connectivity (basic checks)
const axios = require('axios');

/**
 * Test connectivity to external services
 * Verifies that required external services (Juice Shop, ZAP) are accessible
 * @async
 * @returns {Promise<void>}
 */
async function testConnectivity() {
  console.log(chalk.blue('\n🌐 Connectivity Test:'));
  
  // Test OWASP Juice Shop availability
  await testJuiceShopConnectivity();
  
  // Test OWASP ZAP API availability
  await testZAPConnectivity();
  
  // Test AI provider connectivity (if applicable)
  await testAIProviderConnectivity();
  
  // Display completion message and next steps
  displayCompletionMessage();
}

/**
 * Test OWASP Juice Shop connectivity
 * Attempts to connect to the target application for security testing
 * @async
 */
async function testJuiceShopConnectivity() {
  try {
    await axios.get(config.juiceShop.url, { timeout: 5000 });
    console.log('   ✅ Juice Shop accessible');
  } catch (error) {
    console.log('   ❌ Juice Shop not accessible');
    console.log(`      Error: ${error.message}`);
  }
}

/**
 * Test OWASP ZAP API connectivity
 * Verifies that ZAP proxy/scanner is running and API is accessible
 * @async
 */
async function testZAPConnectivity() {
  try {
    await axios.get(`http://${config.zap.api.host}:${config.zap.api.port}`, { timeout: 5000 });
    console.log('   ✅ ZAP accessible');
  } catch (error) {
    console.log('   ❌ ZAP not accessible');
    console.log(`      Error: ${error.message}`);
  }
}

/**
 * Test AI provider connectivity (for cloud providers)
 * Attempts basic connectivity test for cloud-based AI services
 * @async
 */
async function testAIProviderConnectivity() {
  if (config.ai.provider === 'ollama') {
    try {
      await axios.get(`${config.ai.ollama.baseUrl}/api/tags`, { timeout: 3000 });
      console.log('   ✅ Ollama accessible');
    } catch (error) {
      console.log('   ❌ Ollama not accessible (run: ollama serve)');
    }
  } else if (config.ai.enabled && config.ai.apiKey) {
    console.log(`   ✅ ${config.ai.provider.toUpperCase()} API key configured`);
  } else {
    console.log('   ⚠️  AI provider not fully configured');
  }
}

/**
 * Display setup completion message and next steps
 * Provides guidance on how to proceed after setup verification
 */
function displayCompletionMessage() {
  console.log(chalk.green('\n✅ Setup verification completed!'));
  console.log(chalk.yellow('\n📝 Next steps:'));
  console.log('   1. Ensure OWASP Juice Shop is running on localhost:3000');
  console.log('   2. Ensure OWASP ZAP is running on localhost:8080');
  console.log('   3. Configure AI provider API key in .env file (if using cloud AI)');
  console.log('   4. For local AI: Install Ollama and run: npm run setup-ollama');
  console.log('   5. Run security assessment: npm test');
  console.log('\n💡 Quick commands:');
  console.log('   🚀 Full assessment: npm test');
  console.log('   🎯 Login only: npm run test:login');
  console.log('   📝 Registration only: npm run test:registration');
  console.log('   🤖 AI demo: node ai-demo.js');
}

// Execute setup verification
runSetupVerification().catch(error => {
  console.error(chalk.red('Setup verification failed:'), error.message);
  console.error(chalk.gray('Stack trace:'), error.stack);
  process.exit(1);
});
