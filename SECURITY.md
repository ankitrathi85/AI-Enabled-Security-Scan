# 🔒 Security Configuration Guide

This document explains how the framework handles sensitive information and configuration security.

## 🛡️ Security Principles Applied

### 1. **Environment Variable Protection**
All sensitive information is now externalized to environment variables:

#### ✅ **Secured Items:**
- **API Keys**: GROQ, OpenAI, Anthropic, ZAP API keys
- **Application Credentials**: Test user passwords (even for demo purposes)
- **Connection Details**: ZAP host/port, Juice Shop URL
- **Configuration Secrets**: Internal configuration flags and settings

#### ❌ **Never Hardcoded:**
- API keys or tokens
- Passwords or credentials
- Service endpoints in production
- Security-sensitive configuration flags

### 2. **Configuration Hierarchy**
The framework uses a secure configuration hierarchy:

```
1. Environment Variables (.env file) 
2. System Environment Variables
3. Secure Defaults (non-sensitive only)
```

## 🔧 Environment Variable Categories

### **🤖 AI Configuration**
```bash
# Primary AI Provider
GROQ_API_KEY=your_actual_groq_key_here
OPENAI_API_KEY=your_actual_openai_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_key_here

# AI Settings
AI_PROVIDER=groq
AI_MODEL=llama3-8b-8192
AI_ENABLED=true
```

### **🎯 Target Application**
```bash
# Test Target Configuration
JUICE_SHOP_URL=http://localhost:3000

# OWASP Juice Shop Credentials (Demo Environment Only)
# ⚠️  IMPORTANT: These are the documented default credentials for OWASP Juice Shop
# ⚠️  ONLY use these when testing against OWASP Juice Shop application
# ⚠️  For other applications, always use secure, unique test credentials
JUICE_SHOP_ADMIN_EMAIL=admin@juice-sh.op
JUICE_SHOP_ADMIN_PASSWORD=admin123
```

**Special Note on Juice Shop Credentials:**
- These are **publicly documented** default credentials for OWASP Juice Shop
- They are **intentionally vulnerable** as part of the security training application
- **Safe to use ONLY** when testing against OWASP Juice Shop
- **Never use default credentials** for real applications or production systems

### **🔍 Security Scanner Configuration**
```bash
# ZAP Security Scanner
ZAP_HOST=localhost
ZAP_PORT=8080
ZAP_API_KEY=optional_but_recommended
```

### **🎭 Browser Configuration**
```bash
# Playwright Settings
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_TIMEOUT=30000
```

### **📊 Reporting Configuration**  
```bash
# Report Generation
REPORT_TITLE=Your Company Security Assessment
REPORT_COMPANY=Your Security Team
REPORT_OUTPUT_DIR=./secure-reports
```

## 🚀 Setup Instructions

### **1. Copy Environment Template**
```bash
cp .env.example .env
```

### **2. Secure Your API Keys**
Edit `.env` and add your actual API keys:
```bash
# Replace with your actual keys
GROQ_API_KEY=gsk_your_actual_groq_key_here_32_chars
OPENAI_API_KEY=sk-your_actual_openai_key_here_48_chars
```

### **3. Verify Security**
Run this command to ensure no sensitive data is in your config:
```bash
grep -r "sk-\|gsk_\|password.*123" config/ || echo "✅ No hardcoded secrets found"
```

## 🔒 Security Best Practices

### **✅ Do's**
- Always use environment variables for sensitive data
- Keep `.env` files out of version control (already in `.gitignore`)
- Use different credentials for different environments
- Rotate API keys regularly
- Use secure credential storage in CI/CD pipelines

### **❌ Don'ts**
- Never commit `.env` files to git
- Never hardcode API keys in source code
- Never use production credentials in test environments
- Never share API keys in chat/email/documentation

## 🔍 Environment Validation

The framework includes automatic validation for critical environment variables:

```javascript
// The framework will warn you if critical variables are missing
if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn('⚠️  No AI API key found. AI analysis will be disabled.');
}
```

## 🛡️ Production Security Considerations

### **For Production Deployments:**
1. **Use Secret Management**: AWS Secrets Manager, Azure Key Vault, etc.
2. **Implement Role-Based Access**: Limit who can access API keys
3. **Enable API Key Restrictions**: Restrict by IP, domain, or usage
4. **Monitor Usage**: Set up alerts for unusual API usage
5. **Regular Key Rotation**: Implement automated key rotation

### **Example Production Environment Variables:**
```bash
# Production AI Configuration
GROQ_API_KEY=${SECRETS_MANAGER_GROQ_KEY}
AI_ENABLED=true
AI_PROVIDER=groq

# Production Security Scanner
ZAP_HOST=${SECURE_ZAP_ENDPOINT}
ZAP_PORT=8443
ZAP_PROTOCOL=https
ZAP_API_KEY=${SECRETS_MANAGER_ZAP_KEY}

# Production Reporting
REPORT_COMPANY=YourCompany Security Team
REPORT_OUTPUT_DIR=/secure/reports/path
LOG_LEVEL=warn
LOG_FILE=true
```

## 🧪 Testing Security Configuration

Test your configuration security with these commands:

```bash
# 1. Verify no hardcoded secrets
npm run security:check

# 2. Test with minimal environment
env -i NODE_PATH=. node -e "console.log(require('./config/config.js'))"

# 3. Validate all environment variables are being used
npm run config:validate
```

## 🆘 Security Issue Response

If you discover any hardcoded secrets or security issues:

1. **Immediate**: Stop using any exposed credentials
2. **Rotate**: Generate new API keys/passwords immediately  
3. **Update**: Fix the configuration and redeploy
4. **Review**: Audit for similar issues elsewhere
5. **Monitor**: Watch for any unauthorized usage

## 📋 Security Checklist

Before deploying or sharing the framework:

- [ ] All API keys are in environment variables
- [ ] No hardcoded passwords in source code
- [ ] `.env` file is in `.gitignore`
- [ ] Production and development environments are separated
- [ ] API keys have appropriate restrictions/scopes
- [ ] Regular key rotation schedule is established
- [ ] Team members know how to handle credential security
- [ ] Security scanning is enabled for credential detection

---

**🔒 Remember: Security is everyone's responsibility. When in doubt, externalize it to environment variables! 🔒**
