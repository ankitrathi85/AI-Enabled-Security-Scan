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

### Prerequisites Setup

#### 1. 🛡️ OWASP ZAP (Local Setup)
ZAP is a free, open-source web application security scanner. This guide covers local installation:

**Download & Install:**
```bash
# Download from official website:
# https://www.zaproxy.org/download/

# For macOS with Homebrew:
brew install zap

# For Ubuntu/Debian:
sudo apt update
sudo apt install zaproxy

# For Windows: Download installer from website
```

**Start ZAP with API Access:**
```bash
# Option 1: Start ZAP GUI with API enabled
zap -daemon -config api.key=YOUR_API_KEY -port 8080

# Option 2: Start ZAP in daemon mode (headless)
zap -daemon -host 0.0.0.0 -port 8080 -config api.key=YOUR_API_KEY

# Option 3: Start ZAP GUI and enable API manually
# 1. Start ZAP GUI
# 2. Go to Tools > Options > API
# 3. Enable API
# 4. Set API key (optional but recommended)
# 5. Allow insecure access (for local development)
```

**Verify ZAP is Running:**
```bash
# Test ZAP API access
curl http://localhost:8080/JSON/core/view/version/

# Should return: {"version":"2.xx.x"}
```

**ZAP Configuration for Framework:**
- **Host**: `localhost`
- **Port**: `8080` 
- **API Access**: Enabled
- **API Key**: Optional but recommended for security

#### 2. 🤖 Ollama Setup (Local AI Models)
Ollama allows you to run large language models locally, providing unlimited AI analysis without API costs.

**Install Ollama:**
```bash
# macOS/Linux:
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download/windows

# Or via package managers:
# macOS:
brew install ollama

# Ubuntu/Debian:
curl -fsSL https://ollama.ai/install.sh | sh
```

**Install Recommended Models:**
```bash
# Install Mistral (7B) - Great for security analysis
ollama pull mistral

# Install CodeLlama (7B) - Excellent for code review and remediation
ollama pull codellama

# Install Llama2 (7B) - Good general purpose model
ollama pull llama2

# Optional: Install larger models (if you have sufficient RAM)
# ollama pull mistral:13b    # Requires ~8GB RAM
# ollama pull codellama:13b  # Requires ~8GB RAM
```

**Start Ollama Service:**
```bash
# Start Ollama service (runs on http://localhost:11434)
ollama serve

# Verify Ollama is running
curl http://localhost:11434/api/tags

# Test model inference
ollama run mistral "Analyze this SQL injection vulnerability"
```

**Configure Framework for Ollama:**
```bash
# In your .env file:
AI_ENABLED=true
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral                    # or codellama, llama2
OLLAMA_TIMEOUT=30000
```

**Model Recommendations:**
- **mistral**: Best for vulnerability analysis and business impact assessment
- **codellama**: Excellent for code review and remediation suggestions  
- **llama2**: Good general-purpose model for executive summaries

#### 3. 🧃 OWASP Juice Shop (Target Application)
```bash
# Option 1: Docker (Recommended)
docker run --rm -p 3000:3000 bkimminich/juice-shop

# Option 2: NPM Global Install
npm install -g juice-shop
juice-shop

# Option 3: Local Development
git clone https://github.com/juice-shop/juice-shop.git
cd juice-shop
npm install
npm start
```

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
   # - Choose AI provider (Ollama for local, or cloud providers)
   # - Configure scan options (enable/disable spider, active, passive scans)
   # - Set test scenarios (comma-separated list or comment out for all)
   ```

3. **Start Prerequisites**
   - OWASP Juice Shop: `http://localhost:3000`
   - OWASP ZAP: `http://localhost:8080` (with API enabled)
   - Ollama (if using local AI): `http://localhost:11434`

4. **Run Security Assessment**
   ```bash
   # ORIGINAL APPROACH - Full security assessment (all scans enabled)
   npm test

   # NEW MOCHA APPROACH - Industry-standard test framework ⭐ RECOMMENDED
   npm run test:mocha              # Complete Mocha-based assessment
   npm run test:mocha:auth         # Authentication tests only
   npm run test:mocha:input        # Input validation tests (XSS, SQL injection)
   npm run test:mocha:business     # Business logic tests (cart, access control)

   # Quick specific tests (original approach)
   npm run test:login              # Login test (3 minutes vs 50+ minutes for full scan)
   npm run test:registration       # Registration test only

   # Functional tests only (no security scanning)  
   ZAP_SPIDER_ENABLED=false ZAP_ACTIVE_SCAN_ENABLED=false ZAP_PASSIVE_SCAN_ENABLED=false npm test

   # Development mode with verbose logging
   LOG_LEVEL=debug npm test
   ```

### 🧪 **NEW: Mocha-Based Testing Framework**

The framework now includes a professional Mocha-based testing approach with better organization and reporting:

```bash
# Complete security assessment using Mocha
npm run test:mocha

# Run specific test categories
npm run test:mocha:auth         # Authentication & session management
npm run test:mocha:input        # XSS, SQL injection, input validation
npm run test:mocha:business     # Cart manipulation, access control

# Advanced filtering
node mocha-runner.js --filter="XSS"
```

**Benefits of Mocha Approach:**
- ✅ **Better test organization** - Separate files for different security domains
- ✅ **Enhanced reporting** - HTML reports with Mochawesome
- ✅ **Industry standard** - Uses widely adopted Mocha framework  
- ✅ **CI/CD ready** - Standard test output formats
- ✅ **Proper assertions** - Chai assertion library

See [MOCHA-APPROACH.md](./MOCHA-APPROACH.md) for detailed documentation.

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

### Multi-Provider AI Support
The framework supports multiple AI providers for flexibility and cost optimization:

#### 🔥 Local AI with Ollama (Recommended for Development)
**Advantages:**
- ✅ **Unlimited Usage** - No API costs or rate limits
- ✅ **Data Privacy** - Everything runs locally
- ✅ **Offline Capability** - No internet required after model download
- ✅ **Fast Response** - No network latency

**Ollama Configuration:**
```bash
# .env configuration for Ollama
AI_ENABLED=true
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral                    # Primary model
OLLAMA_FALLBACK_MODEL=codellama        # Fallback model
OLLAMA_TIMEOUT=30000                   # Request timeout (30s)
OLLAMA_MAX_TOKENS=4000                 # Max response tokens
```

**Model Performance Comparison:**
```bash
# Mistral (7B) - Best for vulnerability analysis
Model: mistral
Strengths: Security analysis, business impact, executive summaries
RAM Required: ~4GB
Speed: Fast
Use Case: Primary model for comprehensive analysis

# CodeLlama (7B) - Best for code review
Model: codellama  
Strengths: Code analysis, remediation suggestions, technical details
RAM Required: ~4GB
Speed: Fast
Use Case: Code-focused security analysis

# Llama2 (7B) - General purpose
Model: llama2
Strengths: General analysis, balanced performance
RAM Required: ~4GB  
Speed: Medium
Use Case: Backup/fallback model
```

**Advanced Ollama Setup:**
```bash
# Install multiple models for specialized tasks
ollama pull mistral          # Primary analysis
ollama pull codellama       # Code review
ollama pull llama2:13b      # Advanced analysis (requires more RAM)

# Custom model configuration in config.js
ai: {
  provider: 'ollama',
  ollama: {
    baseUrl: 'http://localhost:11434',
    models: {
      primary: 'mistral',           // Main analysis
      codeReview: 'codellama',      // Code-specific tasks
      executive: 'llama2',          // Executive summaries
    },
    timeout: 30000,
    maxTokens: 4000,
    temperature: 0.7,               // Creativity vs consistency
  }
}
```

#### ☁️ Cloud AI Providers
**For production or when local resources are limited:**

**GROQ (Recommended Cloud Option):**
```bash
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your-groq-key-here
AI_MODEL=llama3-8b-8192                # Fast inference (default)
# AI_MODEL=llama3-70b-8192             # More capable, slower  
# AI_MODEL=mixtral-8x7b-32768          # Excellent reasoning
```

**OpenAI:**
```bash
AI_PROVIDER=openai  
OPENAI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-3.5-turbo                 # Cost-effective (default)
# AI_MODEL=gpt-4                       # More capable but expensive
# AI_MODEL=gpt-4-turbo-preview         # Latest with improved context
```

**Anthropic Claude:**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-key-here  
AI_MODEL=claude-3-sonnet-20240229      # Balanced performance (default)
# AI_MODEL=claude-3-haiku-20240307     # Fast and affordable
# AI_MODEL=claude-3-opus-20240229      # Most capable
```

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

# AI Provider Selection (choose one)
AI_PROVIDER=ollama                                # Local AI: ollama, groq, openai, anthropic

# Cloud AI API Keys (choose based on AI_PROVIDER)
OPENAI_API_KEY=sk-your-openai-key-here            # OpenAI API key
ANTHROPIC_API_KEY=your-anthropic-key-here         # Anthropic Claude API key  
GROQ_API_KEY=gsk_your-groq-key-here              # GROQ API key

# Cloud AI Model Configuration
AI_MODEL=llama3-8b-8192                           # Model name for cloud providers

# Ollama Configuration (for local AI)
OLLAMA_BASE_URL=http://localhost:11434            # Ollama service URL
OLLAMA_MODEL=mistral                              # Primary model: mistral, codellama, llama2
OLLAMA_FALLBACK_MODEL=codellama                   # Fallback model if primary fails
OLLAMA_TIMEOUT=30000                              # Request timeout (milliseconds)
OLLAMA_MAX_TOKENS=4000                            # Maximum response tokens

# =============================================================================
# ZAP Configuration  
# =============================================================================
ZAP_API_KEY=your-zap-api-key                     # ZAP API key (optional but recommended)
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

#### 🛡️ ZAP Connection Issues
```bash
# Issue: ZAP Connection Failed
# Solution 1: Check if ZAP is running
ps aux | grep zap
# If not running, start ZAP:
zap -daemon -host 0.0.0.0 -port 8080

# Solution 2: Verify ZAP API access
curl http://localhost:8080/JSON/core/view/version/
# Should return: {"version":"2.xx.x"}

# Solution 3: Enable API access in ZAP GUI
# 1. Start ZAP GUI
# 2. Go to Tools > Options > API  
# 3. Enable API and allow insecure access
# 4. Set API key and update .env file

# Solution 4: Check firewall/port conflicts
netstat -an | grep 8080
# Make sure port 8080 is available
```

#### 🤖 Ollama Setup Issues
```bash
# Issue: Ollama service not running
# Check if Ollama is running:
ps aux | grep ollama
curl http://localhost:11434/api/tags

# Start Ollama service:
ollama serve

# Issue: Model not found
# List installed models:
ollama list

# Install missing models:
ollama pull mistral
ollama pull codellama

# Issue: Insufficient RAM for model
# Check available memory:
free -h  # Linux
vm_stat  # macOS

# Solutions:
# 1. Use smaller models: mistral:7b instead of mistral:13b
# 2. Close other applications to free RAM
# 3. Use quantized models: ollama pull mistral:7b-q4_0

# Issue: Slow model responses
# Optimize Ollama performance:
# 1. Ensure SSD storage (not HDD)
# 2. Allocate more RAM: export OLLAMA_MAX_LOADED_MODELS=1
# 3. Use GPU acceleration if available

# Issue: Model download stuck
# Clear Ollama cache and retry:
rm -rf ~/.ollama/models/*
ollama pull mistral
```

#### 🧃 Juice Shop Issues
```bash
# Issue: Juice Shop not accessible
# Check if running:
curl http://localhost:3000
# Start Juice Shop:
docker run --rm -p 3000:3000 bkimminich/juice-shop

# Issue: Port conflicts
# Use different port:
docker run --rm -p 3001:3000 bkimminich/juice-shop
# Update JUICE_SHOP_URL=http://localhost:3001 in .env
```

**AI Analysis Disabled or Failing**
```bash
# For Ollama (Local AI):
# 1. Check Ollama service
ollama serve &
curl http://localhost:11434/api/tags

# 2. Verify model installation
ollama list
ollama pull mistral  # if missing

# 3. Test model directly
ollama run mistral "Test message"

# 4. Check configuration
AI_ENABLED=true
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# For Cloud AI:
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

# Test individual components
node test-setup.js           # Verify framework setup
npm run test:login           # Test login scenario only (fast)
npm run test:registration    # Test registration scenario only
```

### Service Verification Commands
```bash
# Check all services are running:
# 1. Juice Shop
curl http://localhost:3000

# 2. ZAP API  
curl http://localhost:8080/JSON/core/view/version/

# 3. Ollama (if using local AI)
curl http://localhost:11434/api/tags
ollama list

# 4. Test framework setup
node test-setup.js
```

### Configuration Validation
```bash
# Validate your .env configuration:
node -e "console.log(require('./config/config.js'))"
```

## 📋 Prerequisites Checklist

### ✅ Required Components
- [ ] **Node.js 16+** installed (`node --version`)
- [ ] **Playwright browsers** installed (`npx playwright install chromium`)
- [ ] **OWASP Juice Shop** running on `localhost:3000` (or custom URL in .env)

### 🛡️ OWASP ZAP Setup (Required for Security Scanning)
- [ ] **ZAP Downloaded** from [zaproxy.org](https://www.zaproxy.org/download/)
- [ ] **ZAP Running** on `localhost:8080` with API enabled
- [ ] **API Access** configured (Tools > Options > API > Enable API)
- [ ] **API Key** set (optional but recommended for security)

**Quick ZAP Setup:**
```bash
# Start ZAP with API enabled
zap -daemon -host 0.0.0.0 -port 8080 -config api.key=YOUR_API_KEY

# Verify ZAP is running
curl http://localhost:8080/JSON/core/view/version/
```

### 🤖 AI Provider Setup (Optional but Recommended)

#### Option A: Local AI with Ollama (Unlimited, Private, Fast)
- [ ] **Ollama Installed** ([ollama.ai](https://ollama.ai))
- [ ] **Ollama Service Running** (`ollama serve`)
- [ ] **Models Downloaded**:
  - [ ] `ollama pull mistral` (Primary model for security analysis)
  - [ ] `ollama pull codellama` (Code review and remediation)
  - [ ] `ollama pull llama2` (Backup/fallback model)

**Quick Ollama Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start service
ollama serve

# Install models (choose based on your RAM)
ollama pull mistral      # 4GB RAM - Best for security analysis
ollama pull codellama    # 4GB RAM - Best for code remediation
ollama pull llama2       # 4GB RAM - General purpose backup

# Verify setup
curl http://localhost:11434/api/tags
ollama list
```

**Ollama Configuration in .env:**
```bash
AI_ENABLED=true
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

#### Option B: Cloud AI Providers (API Key Required)
Choose one of these cloud providers:

- [ ] **GROQ** (Recommended - Fast & Affordable)
  - [ ] Account created at [console.groq.com](https://console.groq.com)
  - [ ] API key generated and added to `.env`: `GROQ_API_KEY=gsk_...`

- [ ] **OpenAI** (Most Popular)
  - [ ] Account created at [platform.openai.com](https://platform.openai.com)
  - [ ] API key generated and added to `.env`: `OPENAI_API_KEY=sk-...`

- [ ] **Anthropic Claude** (Privacy-Focused)
  - [ ] Account created at [console.anthropic.com](https://console.anthropic.com)
  - [ ] API key generated and added to `.env`: `ANTHROPIC_API_KEY=...`

### 📦 Framework Configuration
- [ ] **Dependencies installed** (`npm install`)
- [ ] **Environment file configured** (`.env` file created from `.env.example`)
- [ ] **Test scenarios selected** (set `TEST_SCENARIOS` in `.env` or leave blank for all)

### 🎯 Configuration Flexibility

#### Minimal Setup (Functional Testing Only)
**Perfect for basic testing without security scanning:**
```bash
# .env configuration
AI_ENABLED=false
ZAP_SPIDER_ENABLED=false
ZAP_ACTIVE_SCAN_ENABLED=false
ZAP_PASSIVE_SCAN_ENABLED=false

# Only requires:
# ✅ Node.js + Playwright 
# ✅ Juice Shop running
# ❌ No ZAP required
# ❌ No AI API keys required
```

#### Security Testing Setup
**For comprehensive security assessment:**
```bash
# .env configuration
AI_ENABLED=true
AI_PROVIDER=ollama  # or groq/openai/anthropic
ZAP_SPIDER_ENABLED=true
ZAP_ACTIVE_SCAN_ENABLED=true
ZAP_PASSIVE_SCAN_ENABLED=true

# Requires:
# ✅ Node.js + Playwright
# ✅ Juice Shop running
# ✅ ZAP running with API enabled  
# ✅ AI provider configured (Ollama or API key)
```

#### Specific Test Scenarios
**For targeted testing (faster execution):**
```bash
# .env configuration
TEST_SCENARIOS=login,registration  # Only run these tests
ZAP_PASSIVE_SCAN_ENABLED=true     # Analyze test traffic
ZAP_SPIDER_ENABLED=false          # Skip full site crawl
ZAP_ACTIVE_SCAN_ENABLED=false     # Skip active vulnerability scan

# Perfect for:
# 🎯 Authentication testing
# ⚡ Quick functional validation  
# 🔄 CI/CD pipeline integration
```

### 🚀 Quick Verification Commands
```bash
# 1. Verify Node.js and npm
node --version && npm --version

# 2. Verify Playwright installation
npx playwright --version

# 3. Verify Juice Shop is running
curl -s http://localhost:3000 | grep -q "OWASP Juice Shop" && echo "✅ Juice Shop OK" || echo "❌ Juice Shop not running"

# 4. Verify ZAP is running (if security scanning enabled)
curl -s http://localhost:8080/JSON/core/view/version/ | grep -q "version" && echo "✅ ZAP OK" || echo "❌ ZAP not running"

# 5. Verify Ollama is running (if using local AI)
curl -s http://localhost:11434/api/tags | grep -q "models" && echo "✅ Ollama OK" || echo "❌ Ollama not running"

# 6. Test framework setup
node test-setup.js

# 7. Run quick test
npm run test:login
```

### 💡 Recommendations

**For Development/Learning:**
- ✅ Use **Ollama** with **Mistral** model (unlimited, fast, private)
- ✅ Start with **login scenario** only (`npm run test:login`)
- ✅ Enable all logging (`LOG_LEVEL=debug PLAYWRIGHT_HEADLESS=false`)

**For Production/CI:**
- ✅ Use **GROQ** for reliable cloud AI (fastest, most affordable)
- ✅ Use specific test scenarios for faster execution
- ✅ Enable headless mode (`PLAYWRIGHT_HEADLESS=true`)

**For Comprehensive Assessment:**
- ✅ Use full ZAP scanning (spider + active + passive)
- ✅ Run all test scenarios for maximum coverage
- ✅ Enable AI analysis for detailed insights and remediation

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
