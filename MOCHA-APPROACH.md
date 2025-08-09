# 🧪 MOCHA-BASED SECURITY TESTING APPROACH

## Overview

The framework now supports two testing approaches:

### 1. **Original Approach** (`npm test`)
- Custom test class with manual result tracking
- Good for simple, integrated testing
- All logic in single test-scenarios.js file

### 2. **New Mocha-Based Approach** (`npm run test:mocha`) ⭐ **RECOMMENDED**
- Industry-standard test framework (Mocha)
- Better test organization and separation of concerns
- Enhanced reporting with Mochawesome
- Proper test assertions with Chai
- Individual test files for different security domains
- Better CI/CD integration

## 🏗️ New Test Structure

```
tests/
├── setup.js                    # Global test setup (ZAP, browser initialization)
├── auth.test.js                # Authentication security tests
├── input-validation.test.js    # XSS, SQL injection, input validation tests  
├── business-logic.test.js      # Cart manipulation, access control tests
└── [future-tests].test.js      # Additional security test categories
```

## 🚀 Usage

### Run All Security Tests
```bash
npm run test:mocha
```

### Run Specific Test Categories
```bash
# Authentication tests only (login, registration)
npm run test:mocha:auth

# Input validation tests (XSS, SQL injection)
npm run test:mocha:input

# Business logic tests (cart, access control)
npm run test:mocha:business
```

### Run Tests Only (without ZAP scanning)
```bash
npm run test:mocha:only
```

### Advanced Filtering
```bash
# Run specific test suites by name
node mocha-runner.js --filter="Login Functionality"
node mocha-runner.js --filter="XSS"
```

## 🎯 Benefits of Mocha Approach

### ✅ **Better Test Organization**
- Separate files for different security domains
- Clear test hierarchy with `describe()` and `it()` blocks
- Easy to add new test categories

### ✅ **Enhanced Reporting** 
- Mochawesome HTML reports with test details
- JSON output for CI/CD integration
- Better test result visualization

### ✅ **Proper Assertions**
- Chai assertion library for robust test validation
- Clear test expectations and failures
- Better debugging information

### ✅ **Industry Standard**
- Uses widely adopted Mocha framework
- Familiar to most JavaScript developers
- Better IDE support and tooling

### ✅ **CI/CD Ready**
- Standard test output formats
- Exit codes for pass/fail detection
- Configurable timeouts and retries

## 📊 Test Reports

The Mocha approach generates multiple report formats:

### HTML Report (Mochawesome)
- Interactive HTML report with test details
- Screenshots and error information
- Located in `./reports/test-results.html`

### JSON Report
- Machine-readable test results
- Perfect for CI/CD integration
- Located in `./reports/test-results.json`

### Security Report
- Comprehensive security assessment
- Combines test results + ZAP findings + AI analysis
- Located in `./reports/security-assessment-[timestamp].html`

## 🔄 Migration Path

You can use both approaches side-by-side:

```bash
# Original approach
npm test                    # Full security assessment
npm run test:login         # Login scenario only

# New Mocha approach  
npm run test:mocha         # Full Mocha-based assessment
npm run test:mocha:auth    # Authentication tests only
```

## 🤖 AI Integration

Both approaches integrate with AI analysis:

1. **Tests generate HTTP traffic** → ZAP proxy captures requests
2. **ZAP performs security scanning** → Identifies vulnerabilities
3. **AI analyzes findings** → Provides insights and recommendations
4. **Reports combine everything** → Test results + ZAP findings + AI analysis

## 🛠️ Configuration

The Mocha approach uses the same configuration as the original:

```bash
# .env configuration
AI_ENABLED=true
AI_PROVIDER=ollama
ZAP_SPIDER_ENABLED=true
ZAP_ACTIVE_SCAN_ENABLED=true
```

Mocha-specific configuration in `.mocharc.json`:

```json
{
  "reporter": "mochawesome",
  "timeout": 60000,
  "require": ["./tests/setup.js"],
  "spec": "tests/**/*.test.js"
}
```

## 🎓 Example Test Structure

```javascript
describe('Authentication Security Tests', function() {
  
  describe('Login Functionality', function() {
    
    it('should successfully submit login credentials', async function() {
      // Test implementation with proper assertions
      await page.goto(`${config.juiceShop.url}/#/login`);
      await page.fill('#email', 'admin@juice-sh.op');
      await page.fill('#password', 'admin123');
      await page.click('#loginButton');
      
      // Proper assertion
      expect(page.url()).to.not.include('/login');
    });
    
    it('should test SQL injection in login form', async function() {
      // Security payload testing
      const sqlPayloads = ["' OR '1'='1", "admin'--"];
      
      for (const payload of sqlPayloads) {
        await page.fill('#email', payload);
        await page.fill('#password', 'test');
        await page.press('#password', 'Enter');
      }
      
      // Record for ZAP analysis
      expect(true).to.be.true; // Test always passes - we're generating traffic
    });
  });
});
```

## 🔮 Future Enhancements

The Mocha structure makes it easy to add:

- **Parallel test execution**
- **Test data management** 
- **Custom reporters**
- **Test retries and stability**
- **Performance testing integration**
- **API security testing**

## 📋 Recommendation

**Use the Mocha approach** (`npm run test:mocha`) for:
- ✅ New development and testing
- ✅ CI/CD pipeline integration  
- ✅ Team collaboration
- ✅ Professional security assessments
- ✅ Better maintainability

**Keep the original approach** (`npm test`) for:
- ✅ Quick manual testing
- ✅ Backward compatibility
- ✅ Simple demonstration purposes
