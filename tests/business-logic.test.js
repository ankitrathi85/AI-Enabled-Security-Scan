/**
 * BUSINESS LOGIC SECURITY TESTS
 * =============================
 * 
 * Tests e-commerce business logic and access control vulnerabilities.
 * These tests focus on cart manipulation, pricing logic, and authorization flaws.
 */

const { expect } = require('chai');
const chalk = require('chalk');
const config = require('../config/config');

describe('Business Logic Security Tests', function() {
  this.timeout(90000); // Longer timeout for complex operations
  
  let page;
  let startTime;
  
  beforeEach(function() {
    page = global.testContext.page;
    startTime = Date.now();
  });
  
  describe('Shopping Cart Operations', function() {
    
    it('should test cart quantity manipulation vulnerabilities', async function() {
      console.log(chalk.cyan('🛒 Testing cart quantity manipulation...'));
      
      const quantityPayloads = [
        { value: '999', type: 'Large Quantity', risk: 'Inventory bypass' },
        { value: '-1', type: 'Negative Quantity', risk: 'Price manipulation' },
        { value: '0', type: 'Zero Quantity', risk: 'Edge case handling' },
        { value: '"><script>alert("XSS")</script>', type: 'XSS in Quantity', risk: 'Code injection' },
        { value: 'abc', type: 'Non-numeric', risk: 'Input validation' },
        { value: '2147483648', type: 'Integer Overflow', risk: 'Numeric overflow' }
      ];
      
      try {
        await page.goto(config.juiceShop.url);
        
        // Add product to cart
        let basketButtonClicked = false;
        const basketSelectors = [
          '.btn-basket',
          'button[aria-label*="basket" i]',
          'button[aria-label*="cart" i]',
          '.mat-icon-button:has(mat-icon[fontIcon="shopping_cart"])'
        ];
        
        for (const selector of basketSelectors) {
          try {
            const button = await page.$(selector);
            if (button && await button.isVisible()) {
              await button.scrollIntoViewIfNeeded();
              await button.click();
              basketButtonClicked = true;
              console.log(chalk.green(`✅ Product added to cart using: ${selector}`));
              break;
            }
          } catch (error) {
            continue;
          }
        }
        
        if (!basketButtonClicked) {
          console.log(chalk.yellow('⚠️  Could not add product, navigating directly to cart'));
        }
        
        await page.waitForTimeout(2000);
        
        // Navigate to cart
        const cartSelectors = [
          '[aria-label="Show the shopping cart"]',
          '[aria-label*="cart" i]',
          '.shopping-cart-button'
        ];
        
        let cartNavigated = false;
        for (const selector of cartSelectors) {
          try {
            const cartButton = await page.$(selector);
            if (cartButton && await cartButton.isVisible()) {
              await cartButton.click();
              cartNavigated = true;
              break;
            }
          } catch (error) {
            continue;
          }
        }
        
        if (!cartNavigated) {
          await page.goto(`${config.juiceShop.url}/#/basket`);
          console.log(chalk.blue('📍 Navigated to cart via direct URL'));
        }
        
        await page.waitForTimeout(3000);
        
        // Test quantity manipulation
        const cartResults = [];
        const quantitySelectors = [
          '.mat-column-quantity input',
          'input[type="number"]',
          '.quantity-input'
        ];
        
        for (const payload of quantityPayloads) {
          try {
            let quantityInput = null;
            
            for (const selector of quantitySelectors) {
              try {
                quantityInput = await page.$(selector);
                if (quantityInput && await quantityInput.isVisible()) {
                  break;
                }
              } catch (error) {
                continue;
              }
            }
            
            if (quantityInput) {
              // Clear and enter new quantity
              await quantityInput.fill('');
              await quantityInput.fill(payload.value);
              await page.keyboard.press('Tab'); // Trigger change event
              await page.waitForTimeout(2000);
              
              // Check for any error messages or changes
              const pageContent = await page.content();
              const hasError = pageContent.includes('error') || pageContent.includes('invalid');
              
              cartResults.push({
                payload: payload.value,
                type: payload.type,
                risk: payload.risk,
                status: 'executed',
                hasError,
                executed: true
              });
              
              console.log(chalk.yellow(`🧪 Quantity payload tested: ${payload.value} (${payload.type})`));
              
            } else {
              cartResults.push({
                payload: payload.value,
                type: payload.type,
                status: 'skipped',
                reason: 'Quantity input not found'
              });
            }
            
          } catch (error) {
            cartResults.push({
              payload: payload.value,
              type: payload.type,
              status: 'error',
              error: error.message
            });
          }
        }
        
        console.log(chalk.green(`✅ Cart quantity manipulation tests completed: ${cartResults.length}`));
        
        global.recordTestResult('Cart Quantity Manipulation', 'PASS', {
          duration: Date.now() - startTime,
          payloadsUsed: quantityPayloads,
          cartResults,
          basketButtonClicked,
          cartNavigated,
          url: page.url()
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Cart manipulation test failed:'), error.message);
        
        global.recordTestResult('Cart Quantity Manipulation', 'FAIL', {
          duration: Date.now() - startTime,
          error: error.message,
          url: page.url()
        });
        
        throw error;
      }
    });
  });
  
  describe('Access Control Tests', function() {
    
    it('should test unauthorized access to admin endpoints', async function() {
      console.log(chalk.cyan('🔓 Testing admin access control...'));
      
      const adminEndpoints = [
        { path: '/administration', description: 'Main admin panel' },
        { path: '/admin', description: 'Alternative admin path' },
        { path: '/#/administration', description: 'Frontend admin route' },
        { path: '/api/users', description: 'User API endpoint' },
        { path: '/rest/admin/application-version', description: 'Admin API endpoint' },
        { path: '/ftp', description: 'File transfer access' }
      ];
      
      try {
        const accessResults = [];
        
        for (const endpoint of adminEndpoints) {
          try {
            const fullUrl = `${config.juiceShop.url}${endpoint.path}`;
            console.log(chalk.blue(`📍 Testing: ${fullUrl}`));
            
            const response = await page.goto(fullUrl);
            const status = response ? response.status() : 'unknown';
            
            await page.waitForTimeout(2000);
            
            const pageTitle = await page.title();
            const pageContent = await page.content();
            const hasAdminContent = pageContent.includes('administration') || 
                                   pageContent.includes('admin') ||
                                   pageContent.includes('users') ||
                                   pageContent.includes('config');
            
            accessResults.push({
              path: endpoint.path,
              description: endpoint.description,
              status,
              accessible: status === 200,
              hasAdminContent,
              pageTitle,
              contentLength: pageContent.length
            });
            
            const statusColor = status === 200 ? 'red' : 'green';
            console.log(chalk[statusColor](`${status === 200 ? '⚠️ ' : '✅ '}${endpoint.path}: ${status}`));
            
          } catch (error) {
            accessResults.push({
              path: endpoint.path,
              description: endpoint.description,
              status: 'error',
              error: error.message
            });
          }
        }
        
        // Count accessible admin endpoints
        const accessibleEndpoints = accessResults.filter(r => r.accessible).length;
        
        console.log(chalk.green(`✅ Admin access control tests completed`));
        console.log(chalk.blue(`📊 Accessible admin endpoints: ${accessibleEndpoints}/${adminEndpoints.length}`));
        
        global.recordTestResult('Admin Access Control', 'PASS', {
          duration: Date.now() - startTime,
          adminEndpoints: adminEndpoints.length,
          accessibleEndpoints,
          accessResults,
          securityRisk: accessibleEndpoints > 0 ? 'HIGH' : 'LOW',
          url: page.url()
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Admin access test failed:'), error.message);
        
        global.recordTestResult('Admin Access Control', 'FAIL', {
          duration: Date.now() - startTime,
          error: error.message,
          url: page.url()
        });
        
        throw error;
      }
    });
  });
});
