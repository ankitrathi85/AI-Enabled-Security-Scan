/**
 * INPUT VALIDATION SECURITY TESTS
 * ===============================
 * 
 * Tests input validation across various forms and search functionality.
 * These tests focus on XSS, SQL injection, and input sanitization vulnerabilities.
 */

const { expect } = require('chai');
const chalk = require('chalk');
const config = require('../config/config');

describe('Input Validation Security Tests', function() {
  this.timeout(60000);
  
  let page;
  let startTime;
  
  beforeEach(function() {
    page = global.testContext.page;
    startTime = Date.now();
  });
  
  describe('Search Functionality', function() {
    
    it('should test XSS payloads in product search', async function() {
      console.log(chalk.cyan('🔍 Testing XSS in product search...'));
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS2")>',
        '"><script>alert("XSS3")</script>',
        "';alert('XSS4');//",
        '<svg onload=alert("XSS5")>',
        'javascript:alert("XSS6")'
      ];
      
      try {
        await page.goto(config.juiceShop.url);
        
        // Find search input
        const searchSelectors = [
          'input[placeholder="Search..."]',
          '.mat-search-box input',
          '#searchQuery',
          'input[type="text"]'
        ];
        
        let searchInput = null;
        for (const selector of searchSelectors) {
          try {
            searchInput = await page.waitForSelector(selector, { timeout: 5000 });
            if (searchInput) break;
          } catch (error) {
            continue;
          }
        }
        
        expect(searchInput, 'Search input should be found').to.not.be.null;
        
        const searchResults = [];
        
        for (const payload of xssPayloads) {
          try {
            await searchInput.fill('');
            await searchInput.fill(payload);
            await searchInput.press('Enter');
            await page.waitForTimeout(3000);
            
            // Check for results or errors
            let resultsCount = 0;
            try {
              resultsCount = await page.$$eval('.mat-grid-tile, .item-wrapper, .product-item', elements => elements.length);
            } catch (error) {
              resultsCount = 0;
            }
            
            searchResults.push({ 
              payload, 
              resultsCount, 
              status: 'executed',
              hasResults: resultsCount > 0
            });
            
            console.log(chalk.yellow(`🧪 XSS payload tested: ${payload.substring(0, 50)}...`));
            
          } catch (error) {
            searchResults.push({ payload, status: 'error', error: error.message });
          }
        }
        
        console.log(chalk.green(`✅ XSS payloads tested: ${searchResults.length}`));
        
        global.recordTestResult('XSS in Search', 'PASS', {
          duration: Date.now() - startTime,
          payloadsUsed: xssPayloads,
          searchResults,
          totalPayloads: xssPayloads.length,
          url: page.url()
        });
        
      } catch (error) {
        console.error(chalk.red('❌ XSS search test failed:'), error.message);
        
        global.recordTestResult('XSS in Search', 'FAIL', {
          duration: Date.now() - startTime,
          error: error.message,
          url: page.url()
        });
        
        throw error;
      }
    });
    
    it('should test SQL injection payloads in product search', async function() {
      console.log(chalk.cyan('🛡️  Testing SQL injection in search...'));
      
      const sqlPayloads = [
        "' OR 1=1--",
        "'; DROP TABLE products;--",
        "' UNION SELECT * FROM users--",
        "' OR '1'='1",
        "1'; INSERT INTO products VALUES(999,'Hacked','Hacked');--"
      ];
      
      try {
        await page.goto(config.juiceShop.url);
        
        const searchInput = await page.waitForSelector('input[placeholder="Search..."], input[type="text"]', { timeout: 5000 });
        expect(searchInput, 'Search input should be found').to.not.be.null;
        
        const searchResults = [];
        
        for (const payload of sqlPayloads) {
          try {
            await searchInput.fill('');
            await searchInput.fill(payload);
            await searchInput.press('Enter');
            await page.waitForTimeout(3000);
            
            // Look for database errors or unusual responses
            const pageContent = await page.content();
            const hasDbError = pageContent.includes('sql') || 
                              pageContent.includes('database') || 
                              pageContent.includes('mysql') ||
                              pageContent.includes('error');
            
            searchResults.push({ 
              payload, 
              status: 'executed',
              hasDatabaseError: hasDbError,
              responseLength: pageContent.length
            });
            
            console.log(chalk.yellow(`🧪 SQL payload tested: ${payload}`));
            
          } catch (error) {
            searchResults.push({ payload, status: 'error', error: error.message });
          }
        }
        
        console.log(chalk.green(`✅ SQL injection payloads tested: ${searchResults.length}`));
        
        global.recordTestResult('SQL Injection in Search', 'PASS', {
          duration: Date.now() - startTime,
          payloadsUsed: sqlPayloads,
          searchResults,
          totalPayloads: sqlPayloads.length,
          url: page.url()
        });
        
      } catch (error) {
        console.error(chalk.red('❌ SQL injection search test failed:'), error.message);
        throw error;
      }
    });
  });
});
