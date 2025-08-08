#!/usr/bin/env node

/**
 * Simple test script to verify framework setup
 */

const chalk = require('chalk');
const config = require('./config/config');

console.log(chalk.cyan('🧪 Testing Framework Setup...\n'));

// Test configuration
console.log(chalk.blue('📋 Configuration Test:'));
console.log(`   Juice Shop URL: ${config.juiceShop.url}`);
console.log(`   ZAP Proxy: ${config.zap.proxy.host}:${config.zap.proxy.port}`);
console.log(`   AI Enabled: ${config.ai.enabled ? '✅ Yes' : '❌ No'}`);
console.log(`   AI Provider: ${config.ai.provider}`);

// Test dependencies
console.log(chalk.blue('\n📦 Dependencies Test:'));

try {
  require('playwright');
  console.log('   ✅ Playwright');
} catch (error) {
  console.log('   ❌ Playwright');
}

try {
  require('axios');
  console.log('   ✅ Axios');
} catch (error) {
  console.log('   ❌ Axios');
}

try {
  require('handlebars');
  console.log('   ✅ Handlebars');
} catch (error) {
  console.log('   ❌ Handlebars');
}

try {
  require('openai');
  console.log('   ✅ OpenAI');
} catch (error) {
  console.log('   ❌ OpenAI');
}

// Test environment
console.log(chalk.blue('\n🔑 Environment Test:'));
console.log(`   Node.js: ${process.version}`);
console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);

// Test connectivity (basic checks)
const axios = require('axios');

async function testConnectivity() {
  console.log(chalk.blue('\n🌐 Connectivity Test:'));
  
  // Test Juice Shop
  try {
    await axios.get(config.juiceShop.url, { timeout: 5000 });
    console.log('   ✅ Juice Shop accessible');
  } catch (error) {
    console.log('   ❌ Juice Shop not accessible');
  }
  
  // Test ZAP
  try {
    await axios.get(`http://${config.zap.api.host}:${config.zap.api.port}`, { timeout: 5000 });
    console.log('   ✅ ZAP accessible');
  } catch (error) {
    console.log('   ❌ ZAP not accessible');
  }
  
  console.log(chalk.green('\n✅ Setup verification completed!'));
  console.log(chalk.yellow('\n📝 Next steps:'));
  console.log('   1. Ensure OWASP Juice Shop is running on localhost:3000');
  console.log('   2. Ensure OWASP ZAP is running on localhost:8080');
  console.log('   3. Add your OpenAI API key to .env file');
  console.log('   4. Run: npm test');
}

testConnectivity().catch(error => {
  console.error(chalk.red('Test failed:'), error.message);
});
