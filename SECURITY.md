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
# AI Provider Selection (Choose One)
AI_PROVIDER=ollama              # 🦙 Local LLM (No API costs/limits)
# AI_PROVIDER=groq              # ☁️  Cloud API (Fast, rate limited)  
# AI_PROVIDER=openai            # ☁️  Cloud API (High quality, costly)
# AI_PROVIDER=anthropic         # ☁️  Cloud API (Advanced reasoning)

# API Keys (only needed for cloud providers)
GROQ_API_KEY=your_actual_groq_key_here
OPENAI_API_KEY=your_actual_openai_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_key_here

# 🦙 OLLAMA Configuration (Local LLM - RECOMMENDED)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=120000
AI_MODEL=mistral               # Options: mistral, codellama, llama3

# ☁️  Cloud AI Models (when not using Ollama)
# AI_MODEL=llama3-8b-8192      # For GROQ
# AI_MODEL=gpt-4               # For OpenAI

# General AI Settings  
AI_ENABLED=true
AI_TEMPERATURE=0.3
AI_TIMEOUT=30000
```

**🎯 AI Provider Comparison:**

| Provider | Cost | Speed | Quality | Rate Limits | Privacy |
|----------|------|-------|---------|-------------|---------|
| **Ollama** | Free | Medium | High | None | Complete |
| GROQ | Free tier | Very Fast | High | 6K tokens/min | Cloud |
| OpenAI | Paid | Fast | Very High | Usage-based | Cloud |
| Anthropic | Paid | Medium | Very High | Usage-based | Cloud |

**🦙 Ollama Setup (Recommended for Unlimited Analysis):**

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama
   
   # Linux  
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Windows
   # Download from https://ollama.com/download
   ```

2. **Setup Models:**
   ```bash
   # Use our automated setup script
   npm run setup-ollama
   
   # Or manual setup:
   ollama serve
   ollama pull mistral        # Best all-around (4.4GB)
   ollama pull codellama      # Best for code analysis (3.8GB)
   ollama pull llama3         # Most advanced (4.7GB)
   ```

3. **Verify Setup:**
   ```bash
   npm run check-ollama       # Check Ollama status and models
   ```

**🎯 Rate Limit Strategies:**

| Provider | Max Vulnerabilities | Batch Size | Delay (ms) | Notes |
|----------|-------------------|------------|------------|--------|
| **Ollama** | 100 | 25 | 500 | No limits, fast local processing |
| GROQ Free | 15 | 5 | 3000 | Conservative for free tier |
| OpenAI | 50 | 20 | 1000 | Moderate usage |
| Anthropic | 40 | 15 | 1500 | Balanced approach |

**⚙️ Advanced Configuration:**
```bash
# For Ollama (No Rate Limits)
AI_MAX_VULNERABILITIES=100     # Analyze all vulnerabilities
AI_BATCH_SIZE=25               # Large batches for speed
AI_DELAY_MS=500                # Minimal delay
AI_TOKEN_LIMIT=50000           # High token limit
AI_ENABLE_FALLBACK=false       # Disable fallback

# For Cloud APIs (Rate Limited)  
AI_MAX_VULNERABILITIES=15      # Conservative limit
AI_BATCH_SIZE=5                # Small batches
AI_DELAY_MS=3000               # Longer delays
AI_TOKEN_LIMIT=4000            # Lower token limit
AI_ENABLE_FALLBACK=true        # Enable rule-based fallback
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
