// Example configuration file - copy to config.js and customize
require('dotenv').config();

const config = {
  // Test execution settings
  mode: process.argv.includes('--quick') ? 'quick' : 'full',
  
  // Target Application Configuration
  juiceShop: {
    url: process.env.JUICE_SHOP_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.JUICE_SHOP_TIMEOUT) || 30000,
    scenarios: [
      'login',
      'registration', 
      'product-search',
      'cart-operations',
      'admin-access'
    ],
    credentials: {
      admin: {
        email: process.env.JUICE_SHOP_ADMIN_EMAIL || 'admin@juice-sh.op',
        password: process.env.JUICE_SHOP_ADMIN_PASSWORD || 'admin123'
      },
      testUser: {
        email: process.env.JUICE_SHOP_TEST_EMAIL || 'test@juice-sh.op',
        password: process.env.JUICE_SHOP_TEST_PASSWORD || 'test123'
      }
    }
  },

  // OWASP ZAP Configuration
  zap: {
    proxy: {
      host: process.env.ZAP_HOST || 'localhost',
      port: parseInt(process.env.ZAP_PORT) || 8080,
      protocol: process.env.ZAP_PROTOCOL || 'http'
    },
    api: {
      host: process.env.ZAP_API_HOST || process.env.ZAP_HOST || 'localhost',
      port: parseInt(process.env.ZAP_API_PORT) || parseInt(process.env.ZAP_PORT) || 8080,
      key: process.env.ZAP_API_KEY || null,
      format: 'json'
    },
    scanPolicies: {
      quick: process.env.ZAP_QUICK_POLICY || 'Default Policy',
      comprehensive: process.env.ZAP_COMPREHENSIVE_POLICY || 'Full Scan Policy'
    },
    spider: {
      maxDepth: parseInt(process.env.ZAP_SPIDER_MAX_DEPTH) || 5,
      maxChildren: parseInt(process.env.ZAP_SPIDER_MAX_CHILDREN) || 10,
      recurse: process.env.ZAP_SPIDER_RECURSE !== 'false',
      contextName: process.env.ZAP_CONTEXT_NAME || 'JuiceShop'
    },
    activeScan: {
      scanPolicyName: process.env.ZAP_ACTIVE_SCAN_POLICY || 'Default Policy',
      method: process.env.ZAP_SCAN_METHOD || 'GET',
      recurse: process.env.ZAP_ACTIVE_SCAN_RECURSE !== 'false'
    },
    timeout: parseInt(process.env.ZAP_SCAN_TIMEOUT) || 300000 // 5 minutes for scans
  },

  // AI Analysis Configuration
  ai: {
    enabled: process.env.AI_ENABLED !== 'false',
    provider: process.env.AI_PROVIDER || 'groq', // 'groq', 'openai', 'anthropic'
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || null,
    model: process.env.AI_MODEL || 'llama3-8b-8192',
    features: {
      vulnerabilityAnalysis: process.env.AI_VULNERABILITY_ANALYSIS !== 'false',
      falsePositiveDetection: process.env.AI_FALSE_POSITIVE_DETECTION !== 'false',
      riskAssessment: process.env.AI_RISK_ASSESSMENT !== 'false',
      businessImpact: process.env.AI_BUSINESS_IMPACT !== 'false',
      remediation: process.env.AI_REMEDIATION !== 'false',
      executiveSummary: process.env.AI_EXECUTIVE_SUMMARY !== 'false',
      trendAnalysis: process.env.AI_TREND_ANALYSIS !== 'false'
    },
    prompts: {
      maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.3,
      timeout: parseInt(process.env.AI_TIMEOUT) || 30000
    },
    fallback: {
      enabled: process.env.AI_FALLBACK_ENABLED !== 'false',
      provider: process.env.AI_FALLBACK_PROVIDER || 'local'
    }
  },

  // Playwright Browser Configuration
  playwright: {
    headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000,
    viewport: { 
      width: parseInt(process.env.PLAYWRIGHT_WIDTH) || 1920, 
      height: parseInt(process.env.PLAYWRIGHT_HEIGHT) || 1080 
    },
    ignoreHTTPSErrors: process.env.PLAYWRIGHT_IGNORE_HTTPS !== 'false',
    video: process.env.PLAYWRIGHT_VIDEO || 'retain-on-failure',
    screenshot: process.env.PLAYWRIGHT_SCREENSHOT || 'only-on-failure',
    proxy: {
      server: `${process.env.ZAP_PROTOCOL || 'http'}://${process.env.ZAP_HOST || 'localhost'}:${process.env.ZAP_PORT || 8080}`
    },
    userAgent: process.env.PLAYWRIGHT_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 SecurityFramework/1.0',
    launchOptions: {
      args: process.env.PLAYWRIGHT_ARGS ? process.env.PLAYWRIGHT_ARGS.split(',') : ['--start-maximized'],
      defaultViewport: null
    }
  },

  // Report Generation Settings
  reporting: {
    outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
    includeAIAnalysis: process.env.INCLUDE_AI_ANALYSIS !== 'false',
    formats: (process.env.REPORT_FORMATS || 'html,json').split(','),
    template: process.env.REPORT_TEMPLATE || 'enhanced', // 'basic', 'enhanced', 'executive'
    branding: {
      title: process.env.REPORT_TITLE || 'AI-Enhanced Security Assessment',
      company: process.env.REPORT_COMPANY || 'Security Team',
      logo: process.env.REPORT_LOGO || null
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
    console: process.env.LOG_CONSOLE !== 'false',
    file: process.env.LOG_FILE === 'true',
    timestamp: process.env.LOG_TIMESTAMP !== 'false'
  }
};

module.exports = config;
