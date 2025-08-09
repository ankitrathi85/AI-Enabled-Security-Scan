/**
 * MOCHA TEST SETUP
 * ================
 * 
 * This file sets up the test environment for Mocha-based security testing.
 * It initializes ZAP proxy, browser automation, and AI analysis components.
 */

const { chromium } = require('playwright');
const config = require('../config/config');
const ZAPClient = require('../src/zap-client');
const chalk = require('chalk');

// Global test context
global.testContext = {
  browser: null,
  page: null,
  zapClient: null,
  startTime: null,
  results: []
};

// Helper function to record test results for AI analysis
global.recordTestResult = function(testName, status, details = {}) {
  const result = {
    testName,
    status,
    timestamp: new Date().toISOString(),
    duration: details.duration || 0,
    details
  };
  
  global.testContext.results.push(result);
  
  const statusColor = status === 'PASS' ? 'green' : 'red';
  console.log(chalk[statusColor](`📝 ${testName}: ${status}`));
};

// Dismiss welcome popup utility function
async function dismissWelcomePopup(page) {
  try {
    await page.waitForTimeout(3000);
    
    const popupSelectors = [
      '[aria-label="Close Welcome Banner"]',
      'button[mat-icon-button]:has(.fa-times)',
      '.mat-icon-button:has(.fa-times)',
      'button:has(.fa-times)',
      '.fa-times'
    ];
    
    for (const selector of popupSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForTimeout(2000);
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Try pressing Escape as fallback
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.log('Welcome popup dismissal failed, continuing...');
  }
}

// Export setup functions for Mocha hooks
module.exports = {
  async setupGlobalEnvironment() {
    console.log(chalk.cyan('🧪 Setting up security testing environment...'));
    
    try {
      // Initialize ZAP client
      global.testContext.zapClient = new ZAPClient();
      await global.testContext.zapClient.initialize();
      console.log(chalk.green('✅ ZAP client initialized'));
      
      // Launch browser with ZAP proxy
      global.testContext.browser = await chromium.launch({
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        proxy: config.playwright.proxy,
        ignoreHTTPSErrors: config.playwright.ignoreHTTPSErrors,
        args: [
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-web-security',
          '--allow-running-insecure-content'
        ]
      });
      
      const context = await global.testContext.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: config.playwright.userAgent,
        ignoreHTTPSErrors: true
      });
      
      global.testContext.page = await context.newPage();
      global.testContext.page.setDefaultTimeout(config.playwright.timeout);
      
      console.log(chalk.green('✅ Browser initialized with ZAP proxy'));
      
      // Navigate to Juice Shop and dismiss welcome popup
      await global.testContext.page.goto(config.juiceShop.url);
      await dismissWelcomePopup(global.testContext.page);
      
      console.log(chalk.green('✅ Application loaded and ready for testing'));
      
      global.testContext.startTime = Date.now();
      
    } catch (error) {
      console.error(chalk.red('❌ Test setup failed:'), error.message);
      throw error;
    }
  },

  async cleanupGlobalEnvironment() {
    console.log(chalk.cyan('🧹 Cleaning up test environment...'));
    
    try {
      if (global.testContext.page) {
        await global.testContext.page.close();
      }
      
      if (global.testContext.browser) {
        await global.testContext.browser.close();
      }
      
      console.log(chalk.green('✅ Browser cleanup completed'));
      
      // Calculate total test duration
      if (global.testContext.startTime) {
        const totalDuration = Date.now() - global.testContext.startTime;
        console.log(chalk.blue(`⏱️  Total test duration: ${totalDuration}ms`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Cleanup failed:'), error.message);
    }
  }
};
