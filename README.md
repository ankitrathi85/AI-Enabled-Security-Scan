# 🛡️ AI-Enhanced Security Test Framework

A comprehensive security testing framework that combines **Playwright**, **OWASP ZAP**, and **OpenAI** to provide intelligent vulnerability analysis for OWASP Juice Shop applications.

## ✨ Key Features

- 🤖 **AI-Powered Analysis** - Smart vulnerability assessment with OpenAI
- 🎭 **Automated Testing** - Playwright browser automation with security payloads
- 🔍 **Security Scanning** - Integrated OWASP ZAP active and passive scanning
- 📊 **Executive Reports** - Business-friendly HTML reports with AI insights
- 🛡️ **False Positive Detection** - ML-based filtering to reduce noise
- 📈 **Risk Assessment** - AI-enhanced risk scoring and business impact analysis
- 💡 **Smart Remediation** - Actionable fix suggestions with code examples
- 🔗 **Vulnerability Correlation** - Identify related security issues

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
   # Edit .env and add your OpenAI API key
   ```

3. **Start Prerequisites**
   - OWASP Juice Shop: `http://localhost:3000`
   - OWASP ZAP: `http://localhost:8080` (with API enabled)

4. **Run Security Assessment**
   ```bash
   npm test                    # Full security assessment
   npm test -- --quick         # Quick test mode (no security scan)
   npm test -- --dev           # Development mode with verbose logging
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

The framework executes these security-focused test scenarios:

### 1. 🔐 Authentication Testing
- Admin login with default credentials
- Session management validation
- Authentication bypass attempts

### 2. 👤 Registration Testing
- User signup process validation
- Input validation testing
- Account enumeration checks

### 3. 🔍 Product Search Testing
- **XSS Payloads**: `<script>alert("XSS")</script>`
- **SQL Injection**: `' OR 1=1--`, `'; DROP TABLE users;--`
- **Alternative XSS**: `<img src=x onerror=alert("XSS")>`
- **Input Validation**: Various malformed inputs

### 4. 🛒 Shopping Cart Testing
- Cart manipulation with invalid quantities
- Price tampering attempts
- Session-based attacks
- Negative and overflow values

### 5. 🔓 Admin Access Testing
- Unauthorized access attempts to:
  - `/administration`
  - `/admin`
  - `/api/users`
  - `/rest/admin/application-version`
  - Other admin endpoints

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

### AI Configuration
```javascript
ai: {
  enabled: true,
  provider: 'openai',  // 'openai', 'anthropic', 'local'
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  features: {
    vulnerabilityAnalysis: true,
    falsePositiveDetection: true,
    riskAssessment: true,
    remediation: true,
    businessImpact: true,
    executiveSummary: true
  }
}
```

### ZAP Configuration
```javascript
zap: {
  proxy: { host: 'localhost', port: 8080 },
  api: { host: 'localhost', port: 8080 },
  scanPolicies: { 
    quick: 'Default Policy', 
    comprehensive: 'Full Scan Policy' 
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
```

**AI Analysis Disabled**
```bash
# Check your API key in .env
OPENAI_API_KEY=your-actual-api-key-here
```

**Browser Launch Failed**
```bash
# Install Playwright browsers
npx playwright install chromium
```

### Debug Mode
```bash
npm test -- --dev  # Enable verbose logging
```

## 📋 Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] OWASP Juice Shop running on `localhost:3000`
- [ ] OWASP ZAP running on `localhost:8080` with API enabled
- [ ] OpenAI API key configured in `.env` file
- [ ] Playwright browsers installed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- 📧 Email: security-team@example.com
- 📚 Documentation: See `/docs` folder
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**⚠️ Disclaimer**: This framework is for authorized security testing only. Do not use against systems you do not own or have explicit permission to test.
