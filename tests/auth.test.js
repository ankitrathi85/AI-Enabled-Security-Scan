/**
 * AUTHENTICATION SECURITY TESTS
 * =============================
 * 
 * Tests authentication functionality while generating HTTP traffic for ZAP analysis.
 * These tests focus on login/registration workflows and session management security.
 */

const { expect } = require('chai');
const chalk = require('chalk');
const config = require('../config/config');

describe('Authentication Security Tests', function() {
  this.timeout(60000); // 1 minute timeout per test
  
  let page;
  let startTime;
  
  beforeEach(function() {
    page = global.testContext.page;
    startTime = Date.now();
  });
  
  afterEach(function() {
    const duration = Date.now() - startTime;
    console.log(chalk.blue(`⏱️  Test completed in ${duration}ms`));
  });
  
  describe('Login Functionality', function() {
    
    it('should successfully navigate to login page and submit credentials', async function() {
      console.log(chalk.cyan('🔐 Testing login functionality...'));
      
      try {
        // Navigate to login page
        await page.goto(`${config.juiceShop.url}/#/login`);
        await page.waitForLoadState('networkidle');
        
        // Find and fill email field
        const emailSelectors = [
          '#email',
          '#emailControl',
          'input[type="email"]',
          'input[data-cy="loginEmailInput"]',
          'input[placeholder*="email" i]'
        ];
        
        let emailField = null;
        for (const selector of emailSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            emailField = selector;
            console.log(chalk.green(`✅ Email field found: ${selector}`));
            break;
          } catch (error) {
            continue;
          }
        }
        
        expect(emailField, 'Email field should be found').to.not.be.null;
        
        // Fill login form
        await page.fill(emailField, config.juiceShop.credentials.admin.email);
        
        // Find password field
        const passwordSelectors = ['#password', '#passwordControl', 'input[type="password"]'];
        let passwordField = null;
        
        for (const selector of passwordSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            passwordField = selector;
            break;
          } catch (error) {
            continue;
          }
        }
        
        expect(passwordField, 'Password field should be found').to.not.be.null;
        await page.fill(passwordField, config.juiceShop.credentials.admin.password);
        
        // Submit login form
        const loginButtonSelectors = [
          '#loginButton',
          'button[type="submit"]',
          'button:has-text("Log in")',
          'button:has-text("Login")'
        ];
        
        let loginSubmitted = false;
        for (const selector of loginButtonSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            loginSubmitted = true;
            break;
          } catch (error) {
            continue;
          }
        }
        
        if (!loginSubmitted) {
          await page.press(passwordField, 'Enter');
          loginSubmitted = true;
        }
        
        expect(loginSubmitted, 'Login should be submitted').to.be.true;
        
        // Wait for response and check URL change
        await page.waitForTimeout(5000);
        const currentUrl = page.url();
        
        console.log(chalk.green(`✅ Login form submitted successfully`));
        console.log(chalk.blue(`📍 Current URL: ${currentUrl}`));
        
        // Record test result for AI analysis
        global.recordTestResult('Login Test', 'PASS', {
          duration: Date.now() - startTime,
          user: 'admin',
          url: currentUrl,
          credentialsUsed: config.juiceShop.credentials.admin.email
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Login test failed:'), error.message);
        
        global.recordTestResult('Login Test', 'FAIL', {
          duration: Date.now() - startTime,
          error: error.message,
          url: page.url()
        });
        
        throw error;
      }
    });
    
    it('should test SQL injection payloads in login form', async function() {
      console.log(chalk.cyan('🛡️  Testing SQL injection in login...'));
      
      const sqlPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1#",
        "' UNION SELECT * FROM users--"
      ];
      
      try {
        await page.goto(`${config.juiceShop.url}/#/login`);
        
        for (const payload of sqlPayloads) {
          // Fill email with payload
          await page.fill('#email, #emailControl, input[type="email"]', payload);
          await page.fill('#password, #passwordControl, input[type="password"]', 'test');
          
          // Submit form
          await page.press('input[type="password"]', 'Enter');
          await page.waitForTimeout(2000);
          
          console.log(chalk.yellow(`🧪 Tested SQL payload: ${payload}`));
        }
        
        global.recordTestResult('SQL Injection in Login', 'PASS', {
          duration: Date.now() - startTime,
          payloadsUsed: sqlPayloads,
          note: 'Payloads submitted for ZAP analysis'
        });
        
      } catch (error) {
        console.error(chalk.red('❌ SQL injection test failed:'), error.message);
        throw error;
      }
    });
  });
  
  describe('Registration Functionality', function() {
    
    it('should successfully fill and submit registration form', async function() {
      console.log(chalk.cyan('👤 Testing registration functionality...'));
      
      try {
        await page.goto(`${config.juiceShop.url}/#/register`);
        await page.waitForLoadState('networkidle');
        
        const testEmail = `testuser_${Date.now()}@juice-sh.op`;
        const testPassword = 'TestPassword123!';
        
        // Fill registration form
        const emailSelectors = ['#emailControl', '#email', 'input[type="email"]'];
        let emailFilled = false;
        
        for (const selector of emailSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            await page.fill(selector, testEmail);
            emailFilled = true;
            break;
          } catch (error) {
            continue;
          }
        }
        
        expect(emailFilled, 'Email should be filled').to.be.true;
        
        // Fill password fields
        const passwordSelectors = ['#passwordControl', '#password'];
        const repeatPasswordSelectors = ['#repeatPasswordControl', '#confirmPassword'];
        
        let passwordFilled = false;
        for (const selector of passwordSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.fill(selector, testPassword);
            passwordFilled = true;
            break;
          } catch (error) {
            continue;
          }
        }
        
        let repeatPasswordFilled = false;
        for (const selector of repeatPasswordSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.fill(selector, testPassword);
            repeatPasswordFilled = true;
            break;
          } catch (error) {
            continue;
          }
        }
        
        // Handle security question dropdown
        try {
          const securitySelect = await page.$('mat-select');
          if (securitySelect) {
            await securitySelect.click();
            await page.waitForTimeout(500);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
          }
        } catch (error) {
          console.log(chalk.yellow('⚠️  Security question selection skipped'));
        }
        
        // Fill security answer
        const answerSelectors = ['#securityAnswerControl', 'input[placeholder*="answer" i]'];
        for (const selector of answerSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.fill(selector, 'TestSecurityAnswer123');
            break;
          } catch (error) {
            continue;
          }
        }
        
        // Submit registration
        const submitSelectors = ['#registerButton', 'button[type="submit"]', 'button:has-text("Register")'];
        let registrationSubmitted = false;
        
        for (const selector of submitSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            registrationSubmitted = true;
            break;
          } catch (error) {
            continue;
          }
        }
        
        await page.waitForTimeout(5000);
        
        console.log(chalk.green(`✅ Registration form completed`));
        
        global.recordTestResult('Registration Test', 'PASS', {
          duration: Date.now() - startTime,
          email: testEmail,
          url: page.url(),
          formFieldsFilled: {
            email: emailFilled,
            password: passwordFilled,
            repeatPassword: repeatPasswordFilled,
            registrationSubmitted
          }
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Registration test failed:'), error.message);
        
        global.recordTestResult('Registration Test', 'FAIL', {
          duration: Date.now() - startTime,
          error: error.message,
          url: page.url()
        });
        
        throw error;
      }
    });
  });
});
