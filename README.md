# 🛡️ AI-Enhanced Security Test Framework

A comprehensive security testing framework that combines **Playwright**, **OWASP ZAP**, and **OpenAI** to provide intelligent vulnerability analysis for OWASP Juice Shop applications.

## ✨ Key Features

- 🤖 **AI-Powered Analysis** - Multi-provider AI support (OpenAI, GROQ, Anthropic) with smart vulnerability assessment
- 🎯 **Selective Testing** - Run specific test scenarios with comma-separated configuration
- 🔧 **Granular Scan Control** - Enable/disable individual scan types (spider, active, passive)
- 🎭 **Enhanced Automation** - Robust Playwright browser automation with improved form handling
- 🔍 **Comprehensive Security Scanning** - Integrated OWASP ZAP with configurable scan policies
- 📊 **Executive Reports** - Business-friendly HTML reports with AI insights
- 🛡️ **False Positive Detection** - ML-based filtering to reduce noise
- 📈 **Risk Assessment** - AI-enhanced risk scoring and business impact analysis
- 💡 **Smart Remediation** - Actionable fix suggestions with code examples
- 🔗 **Vulnerability Correlation** - Identify related security issues
- 📝 **Enhanced Registration Testing** - Complete form validation with repeat password, security questions
- 🛒 **Robust Cart Testing** - Improved e-commerce functionality testing with fallback strategies
- ⚙️ **Flexible Configuration** - Environment-based configuration with comprehensive options

## 🚀 Quick Start

### Automated Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup
1. **Install Dependencies**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and configure your settings:
   # - Add AI API key (OpenAI/GROQ/Anthropic)
   # - Configure scan options (enable/disable spider, active, passive scans)
   # - Set test scenarios (comma-separated list or comment out for all)
   ```

3. **Start Prerequisites**
   - OWASP Juice Shop: `http://localhost:3000`
   - OWASP ZAP: `http://localhost:8080` (with API enabled)

4. **Run Security Assessment**
   ```bash
   # Full security assessment (all scans enabled)
   npm test

   # Functional tests only (no security scanning)  
   ZAP_SPIDER_ENABLED=false ZAP_ACTIVE_SCAN_ENABLED=false ZAP_PASSIVE_SCAN_ENABLED=false npm test

   # Specific test scenarios only
   TEST_SCENARIOS=login,registration npm test

   # Development mode with verbose logging
   LOG_LEVEL=debug npm test
   ```

### 🎯 Common Usage Patterns

**Authentication Testing Only:**
```bash
# Set in .env file:
TEST_SCENARIOS=login,registration
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false  
ZAP_PASSIVE_SCAN_ENABLED=true    # Analyze auth traffic
```

**Full Security Assessment:**
```bash
# Set in .env file:  
# TEST_SCENARIOS=   (comment out to run all)
ZAP_SPIDER_ENABLED=true
ZAP_ACTIVE_SCAN_ENABLED=true
ZAP_PASSIVE_SCAN_ENABLED=true
AI_ENABLED=true
```

**Quick Functional Validation:**
```bash
# Set in .env file:
TEST_SCENARIOS=cart-operations
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false
ZAP_PASSIVE_SCAN_ENABLED=false
AI_ENABLED=false
```

## 🏗️ Architecture

```
📁 Security-Scan/
├── 📄 index.js                 # Main entry point
├── 📁 src/
│   ├── 🔧 zap-client.js        # OWASP ZAP API integration
│   ├── 🎭 test-scenarios.js    # Playwright test automation
│   ├── 🤖 ai-analyzer.js       # AI vulnerability analysis
│   ├── 🏃 test-runner.js       # Test orchestration
│   └── 📊 report-generator.js  # HTML report generation
├── � config/
│   └── ⚙️ config.js            # Framework configuration
├── 📁 prompts/                 # AI prompt templates
├── 📁 reports/                 # Generated reports
└── 📁 templates/               # Report templates
```

## 🎯 Test Scenarios

The framework executes these security-focused test scenarios with enhanced form handling:

### 1. 🔐 Authentication Testing (`login`)
- **Purpose**: Tests login functionality and session management vulnerabilities
- **Security Focus**: Authentication bypass, session fixation, credential validation
- **What it does**:
  - Navigates to login page with multiple fallback selectors
  - Fills admin credentials (configurable via environment variables)
  - Tests authentication workflow and session establishment
  - Generates HTTP traffic for passive security analysis

### 2. 👤 Registration Testing (`registration`) - **ENHANCED**
- **Purpose**: Tests user registration process and input validation security
- **Security Focus**: Input validation, weak password policies, account enumeration
- **What it does**:
  - **✅ Complete Form Filling**: Email, Password, Repeat Password, Security Question, Security Answer
  - **✅ Robust Field Detection**: Multiple selector fallback strategies
  - **✅ Dropdown Handling**: Improved security question selection
  - **✅ Validation Testing**: Tests form validation with comprehensive data
  - **✅ Enhanced Logging**: Clear feedback on form interaction success

### 3. 🔍 Product Search Testing (`product-search`)
- **Purpose**: Tests search functionality with security payloads for injection vulnerabilities
- **Security Focus**: XSS, SQL injection, input sanitization
- **Payloads Tested**:
  - **Normal Search**: `apple` (baseline functionality)
  - **XSS Payloads**: `<script>alert("XSS")</script>`
  - **SQL Injection**: `' OR 1=1--`, `'; DROP TABLE users;--`
  - **Alternative XSS**: `<img src=x onerror=alert("XSS2")>`
  - **Input Validation**: Non-standard characters and formats

### 4. 🛒 Shopping Cart Testing (`cart-operations`) - **ENHANCED**  
- **Purpose**: Tests e-commerce functionality and business logic security
- **Security Focus**: Cart manipulation, price tampering, business logic bypass
- **What it does**:
  - **✅ Improved Product Selection**: Multiple selector fallback strategies
  - **✅ Robust Cart Navigation**: 7 different cart navigation selectors
  - **✅ Graceful Error Handling**: Direct cart URL navigation fallback
  - **Business Logic Testing**: Quantity manipulation with various payloads:
    - Large quantities: `999` (inventory bypass testing)
    - Negative quantities: `-1` (price manipulation testing)  
    - Zero quantities: `0` (edge case testing)
    - XSS in quantity: `"><script>alert("XSS")</script>`
    - Non-numeric input: `abc` (input validation testing)

### 5. 🔓 Admin Access Testing (`admin-access`)
- **Purpose**: Tests for unauthorized access to administrative functions
- **Security Focus**: Broken access control, privilege escalation, unprotected endpoints
- **Endpoints Tested**:
  - `/administration` - Main admin panel
  - `/admin` - Alternative admin path  
  - `/profile` - User profile access
  - `/api/users` - API endpoint for user data
  - `/rest/admin/application-version` - Admin API endpoint
  - `/#/administration` - Frontend admin route
  - `/#/admin` - Alternative frontend route
  - `/ftp` - File transfer access

### 🎯 Scenario Selection

**Run Specific Scenarios:**
```bash
# Single scenario
TEST_SCENARIOS=registration

# Multiple scenarios
TEST_SCENARIOS=login,registration,cart-operations  

# Security-focused testing
TEST_SCENARIOS=admin-access,product-search

# Authentication testing
TEST_SCENARIOS=login,registration
```

**Run All Scenarios:**
```bash
# Comment out or remove TEST_SCENARIOS line in .env
# TEST_SCENARIOS=login,registration,product-search,cart-operations,admin-access
```

## 🤖 AI Integration

### Intelligent Vulnerability Analysis
- **Business Impact Assessment** - Translates technical findings to business risks
- **Severity Scoring** - AI-enhanced risk calculations
- **False Positive Detection** - ML-based noise reduction
- **Remediation Suggestions** - Specific fix recommendations with code examples

### Executive Reporting
- **Natural Language Summaries** - Plain English explanations
- **Business Context** - Financial and operational impact analysis
- **Strategic Recommendations** - Long-term security improvements
- **Compliance Mapping** - Regulatory requirement alignment

### Example AI Enhancement

**Before AI**: 
```
SQL Injection vulnerability found in /api/users endpoint
Risk: High
```

**After AI Enhancement**:
```
🤖 AI Analysis: Critical SQL Injection Vulnerability

Business Impact: HIGH RISK - This vulnerability allows attackers to access 
the entire user database, including passwords and personal information. 
Estimated business impact: $500K+ in potential damages.

Technical Details: The /api/users endpoint concatenates user input directly 
into SQL queries without sanitization.

Remediation: 
1. Implement parameterized queries in UserController.java (line 142)
2. Add input validation for user ID parameters  
3. Enable SQL query logging to detect future injection attempts

False Positive Likelihood: 5% (High confidence this is a real vulnerability)
```

## ⚙️ Configuration

### Complete Environment Variables (.env)

```bash
# =============================================================================
# AI Configuration
# =============================================================================
AI_ENABLED=true                                    # Enable/disable AI analysis
OPENAI_API_KEY=sk-your-openai-key-here            # OpenAI API key
ANTHROPIC_API_KEY=your-anthropic-key-here         # Anthropic Claude API key  
GROQ_API_KEY=gsk_your-groq-key-here              # GROQ API key
AI_PROVIDER=groq                                   # AI provider: groq, openai, anthropic
AI_MODEL=llama3-8b-8192                           # Model name

# =============================================================================
# ZAP Configuration
# =============================================================================
ZAP_API_KEY=your-zap-api-key                     # ZAP API key (optional)
ZAP_HOST=localhost                                # ZAP proxy host
ZAP_PORT=8080                                     # ZAP proxy port

# ZAP Scan Control - Enable/Disable Individual Scan Types
ZAP_SPIDER_ENABLED=true                           # Enable spider/crawling scan
ZAP_ACTIVE_SCAN_ENABLED=true                      # Enable active vulnerability scan
ZAP_PASSIVE_SCAN_ENABLED=true                     # Enable passive scan analysis

# =============================================================================
# Test Configuration
# =============================================================================
# Available scenarios: login, registration, product-search, cart-operations, admin-access
# Use comma-separated values for multiple scenarios: TEST_SCENARIOS=login,registration,cart-operations
# Comment out or remove TEST_SCENARIOS to run all available scenarios
TEST_SCENARIOS=login,registration                 # Run specific test scenarios

JUICE_SHOP_URL=http://localhost:3000              # Target application URL
JUICE_SHOP_TIMEOUT=30000                          # Request timeout in ms

# Test Credentials (optional - defaults provided)
JUICE_SHOP_ADMIN_EMAIL=admin@juice-sh.op
JUICE_SHOP_ADMIN_PASSWORD=admin123
JUICE_SHOP_TEST_EMAIL=test@juice-sh.op
JUICE_SHOP_TEST_PASSWORD=test123

# =============================================================================
# Framework Configuration
# =============================================================================
NODE_ENV=development                              # Environment: development, production
LOG_LEVEL=info                                    # Logging: debug, info, warn, error

# Playwright Browser Configuration
PLAYWRIGHT_HEADLESS=false                        # Run browser in visible mode
PLAYWRIGHT_TIMEOUT=30000                         # Browser timeout
PLAYWRIGHT_WIDTH=1920                            # Browser width
PLAYWRIGHT_HEIGHT=1080                           # Browser height

# =============================================================================
# Report Configuration  
# =============================================================================
REPORT_OUTPUT_DIR=./reports                       # Report output directory
INCLUDE_AI_ANALYSIS=true                          # Include AI analysis in reports
REPORT_FORMATS=html,json                          # Report formats (comma-separated)
REPORT_TEMPLATE=enhanced                          # Template: basic, enhanced, executive
REPORT_TITLE=AI-Enhanced Security Assessment      # Custom report title
REPORT_COMPANY=Security Team                      # Company name for reports
```

### Scan Control Features

**🚀 NEW: Granular Scan Control**
You can now enable/disable individual scan types:

```bash
# Run functional tests only (no security scanning)
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false  
ZAP_PASSIVE_SCAN_ENABLED=false

# Run only passive scanning (analyze test traffic)
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false
ZAP_PASSIVE_SCAN_ENABLED=true

# Full security assessment (all scans enabled)
ZAP_SPIDER_ENABLED=true
ZAP_ACTIVE_SCAN_ENABLED=true
ZAP_PASSIVE_SCAN_ENABLED=true
```

**🎯 NEW: Selective Test Scenarios**
Run specific test combinations:

```bash
# Authentication testing only
TEST_SCENARIOS=login,registration

# E-commerce functionality testing
TEST_SCENARIOS=product-search,cart-operations  

# Security-focused testing
TEST_SCENARIOS=admin-access,product-search

# Single scenario testing  
TEST_SCENARIOS=registration

# All scenarios (comment out or remove line)
# TEST_SCENARIOS=login,registration,product-search,cart-operations,admin-access
```

### AI Configuration Options
```javascript
ai: {
  enabled: process.env.AI_ENABLED !== 'false',
  provider: process.env.AI_PROVIDER || 'groq',    // groq, openai, anthropic
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  model: process.env.AI_MODEL || 'llama3-8b-8192',
  features: {
    vulnerabilityAnalysis: true,
    falsePositiveDetection: true,
    riskAssessment: true,
    remediation: true,
    businessImpact: true,
    executiveSummary: true,
    trendAnalysis: true
  }
}
```

### ZAP Configuration
```javascript
zap: {
  proxy: { host: 'localhost', port: 8080 },
  api: { host: 'localhost', port: 8080, key: process.env.ZAP_API_KEY },
  spider: {
    enabled: process.env.ZAP_SPIDER_ENABLED !== 'false',
    maxDepth: 5,
    maxChildren: 10
  },
  activeScan: {
    enabled: process.env.ZAP_ACTIVE_SCAN_ENABLED !== 'false',
    scanPolicyName: 'Default Policy'
  },
  passiveScan: {
    enabled: process.env.ZAP_PASSIVE_SCAN_ENABLED !== 'false'
  }
}
```

## 📊 Sample Report Output

```
📊 SECURITY ASSESSMENT SUMMARY
═════════════════════════════
📅 Report Generated: 2024-08-06T15:30:45.123Z
🎭 Test Results: 4/5 passed (80.0%)
🔍 Security Findings: 15 total
   ├─ High Risk: 3
   ├─ Medium Risk: 7
   └─ Low Risk: 5
📊 Overall Risk Score: 7.2/10
🤖 AI Enhanced: 2 potential false positives detected
═════════════════════════════
📄 HTML Report: ./reports/security-assessment-2024-08-06.html
```

## 🔧 Advanced Usage

### Custom Test Scenarios
```javascript
// Add custom test in src/test-scenarios.js
async testCustomScenario() {
  // Your custom security test
}
```

### Custom AI Prompts
```bash
# Edit prompt templates in prompts/
prompts/vulnerability-analysis.txt
prompts/executive-summary.txt
prompts/remediation-suggestions.txt
```

### Multiple AI Providers
```javascript
// Switch AI providers in config/config.js
ai: {
  provider: 'anthropic',  // or 'openai', 'local'
  apiKey: process.env.ANTHROPIC_API_KEY
}
```

## 📈 Workflow

1. **🔄 Initialization** - Start ZAP session, configure proxy
2. **🎭 Test Execution** - Run Playwright tests through ZAP proxy
3. **🔍 Security Scanning** - Execute ZAP spider and active scans
4. **🤖 AI Analysis** - Process vulnerabilities through AI for enhanced insights
5. **📊 Report Generation** - Create comprehensive HTML reports with AI analysis

## 🛠️ Troubleshooting

### Common Issues

**ZAP Connection Failed**
```bash
# Ensure ZAP is running with API enabled
# Start ZAP and enable API in Options > API
# Note: ZAP API key configuration will be addressed in future updates
```

**AI Analysis Disabled or Failing**
```bash
# Check your API key configuration in .env
OPENAI_API_KEY=sk-your-actual-openai-key-here
# OR
GROQ_API_KEY=gsk_your-actual-groq-key-here
# OR  
ANTHROPIC_API_KEY=your-actual-anthropic-key-here

# Ensure AI is enabled
AI_ENABLED=true
```

**No Tests Running**
```bash
# Check TEST_SCENARIOS configuration
# Valid scenarios: login, registration, product-search, cart-operations, admin-access

# Run specific scenarios
TEST_SCENARIOS=login,registration

# Run all scenarios (comment out line)
# TEST_SCENARIOS=login,registration,product-search,cart-operations,admin-access
```

**Browser Launch Failed**
```bash
# Install Playwright browsers
npx playwright install chromium

# Check browser configuration
PLAYWRIGHT_HEADLESS=false    # Set to true for headless mode
```

**Scan Configuration Issues**
```bash
# Verify scan settings in .env
ZAP_SPIDER_ENABLED=true      # Enable spider scan
ZAP_ACTIVE_SCAN_ENABLED=true # Enable active vulnerability scan  
ZAP_PASSIVE_SCAN_ENABLED=true # Enable passive scan analysis

# For functional testing only (no security scans)
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false
ZAP_PASSIVE_SCAN_ENABLED=false
```

**Registration Form Issues**
```bash
# The registration test now includes enhanced form handling:
# ✅ Finds email, password, repeat password, security question, security answer fields
# ✅ Uses multiple selector fallback strategies
# ✅ Handles dropdown selection robustly
# ✅ Provides detailed logging for debugging

# If registration still fails, check browser console in visible mode:
PLAYWRIGHT_HEADLESS=false
LOG_LEVEL=debug
```

### Debug Mode
```bash
# Enable verbose logging
LOG_LEVEL=debug npm test

# Run in development mode with full visibility  
NODE_ENV=development PLAYWRIGHT_HEADLESS=false LOG_LEVEL=debug npm test
```

### Configuration Validation
```bash
# Validate your .env configuration:
node -e "console.log(require('./config/config.js'))"
```

## 📋 Prerequisites Checklist

### Required
- [ ] Node.js 16+ installed
- [ ] OWASP Juice Shop running on `localhost:3000` (or custom URL in .env)
- [ ] Playwright browsers installed (`npx playwright install chromium`)

### Optional (based on configuration)
- [ ] OWASP ZAP running on `localhost:8080` with API enabled (required if any ZAP scans enabled)
- [ ] AI API key configured in `.env` file (required if `AI_ENABLED=true`)
  - OpenAI API key (`OPENAI_API_KEY`)
  - OR GROQ API key (`GROQ_API_KEY`) 
  - OR Anthropic API key (`ANTHROPIC_API_KEY`)

### Configuration Flexibility
- ✅ **Functional Testing Only**: No ZAP or AI required - just set all scan flags to `false`
- ✅ **Passive Scanning**: Only requires ZAP proxy - no active scanning
- ✅ **Custom Test Scenarios**: Run any combination of test scenarios
- ✅ **Multiple AI Providers**: Choose between OpenAI, GROQ, or Anthropic
- ✅ **Development Mode**: Run with visible browser and debug logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

-  Documentation: See `/docs` folder
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**⚠️ Disclaimer**: This framework is for authorized security testing only. Do not use against systems you do not own or have explicit permission to test.
