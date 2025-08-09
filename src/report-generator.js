const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const config = require('../config/config');

/**
 * REPORT GENERATOR CLASS
 * ======================
 * 
 * This class handles generation of comprehensive security assessment reports
 * in multiple formats (HTML, JSON, PDF) from ZAP scan results and AI analysis.
 * 
 * CORE FUNCTIONALITY:
 * - Processes raw ZAP security alerts into structured report data
 * - Integrates AI-powered vulnerability analysis and prioritization
 * - Generates executive summaries for management audiences
 * - Creates detailed technical reports for security teams
 * - Produces multiple output formats for different stakeholders
 * 
 * REPORT FEATURES:
 * - Executive Summary: High-level overview with risk metrics and recommendations
 * - Vulnerability Details: Technical details, evidence, and remediation steps
 * - Risk Assessment: Prioritized vulnerability list with business impact
 * - Evidence Collection: Screenshots, request/response data, and proof-of-concept
 * - Remediation Guidance: Step-by-step fixes and security best practices
 * 
 * TEMPLATE SYSTEM:
 * - Handlebars templates for flexible report customization
 * - Responsive HTML reports with interactive elements
 * - PDF generation for formal documentation and archival
 * - JSON exports for integration with other security tools
 * 
 * AI INTEGRATION:
 * - Leverages AI analysis for vulnerability explanations
 * - Generates business impact assessments
 * - Provides contextual remediation recommendations
 * - Creates executive-level summaries and insights
 */
class ReportGenerator {
  constructor() {
    this.outputDir = config.reporting.outputDir;
    this.templateDir = path.join(__dirname, '..', 'templates');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = chalk.cyan('[REPORT]');
    
    switch (type) {
      case 'error':
        console.log(`${prefix} ${chalk.red('ERROR')} ${timestamp}: ${message}`);
        break;
      case 'warn':
        console.log(`${prefix} ${chalk.yellow('WARN')} ${timestamp}: ${message}`);
        break;
      case 'success':
        console.log(`${prefix} ${chalk.green('SUCCESS')} ${timestamp}: ${message}`);
        break;
      default:
        console.log(`${prefix} ${chalk.white('INFO')} ${timestamp}: ${message}`);
    }
  }

  async initialize() {
    try {
      await fs.ensureDir(this.outputDir);
      await fs.ensureDir(this.templateDir);
      this.log(`Report directory initialized: ${this.outputDir}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to initialize report directory: ${error.message}`, 'error');
      return false;
    }
  }

  registerHandlebarsHelpers() {
    // Helper for formatting dates
    Handlebars.registerHelper('formatDate', function(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    });

    // Helper for risk level styling
    Handlebars.registerHelper('riskClass', function(risk) {
      if (!risk) return 'risk-unknown';
      
      switch (risk.toLowerCase()) {
        case 'high':
        case 'critical':
          return 'risk-high';
        case 'medium':
          return 'risk-medium';
        case 'low':
          return 'risk-low';
        case 'informational':
          return 'risk-info';
        default:
          return 'risk-unknown';
      }
    });

    // Helper for risk score color
    Handlebars.registerHelper('riskScoreClass', function(score) {
      if (score >= 8) return 'score-critical';
      if (score >= 6) return 'score-high';
      if (score >= 4) return 'score-medium';
      if (score >= 2) return 'score-low';
      return 'score-info';
    });

    // Helper for AI confidence styling
    Handlebars.registerHelper('confidenceClass', function(score) {
      if (score >= 80) return 'confidence-high';
      if (score >= 60) return 'confidence-medium';
      return 'confidence-low';
    });

    // Helper for formatting numbers
    Handlebars.registerHelper('formatNumber', function(num) {
      return Number(num).toLocaleString();
    });

    // Helper for percentage formatting
    Handlebars.registerHelper('formatPercent', function(num) {
      return `${Number(num).toFixed(1)}%`;
    });

    // Helper for conditional rendering
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Helper for array length
    Handlebars.registerHelper('length', function(array) {
      return array ? array.length : 0;
    });

    // Helper for JSON stringify
    Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context, null, 2);
    });
  }

  async getHtmlTemplate() {
    const templatePath = path.join(this.templateDir, 'report.hbs');
    
    try {
      if (await fs.pathExists(templatePath)) {
        return await fs.readFile(templatePath, 'utf-8');
      }
    } catch (error) {
      this.log(`Failed to read template file: ${error.message}`, 'warn');
    }
    
    // Return default template if file doesn't exist
    return this.getDefaultHtmlTemplate();
  }

  getDefaultHtmlTemplate() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{reportTitle}} - Security Assessment Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
        }
        
        .ai-badge {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-left: 10px;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            align-items: center;
        }
        
        .metric-value {
            font-weight: bold;
            font-size: 1.2em;
        }
        
        .risk-high { color: #e74c3c; }
        .risk-medium { color: #f39c12; }
        .risk-low { color: #3498db; }
        .risk-info { color: #95a5a6; }
        
        .score-critical { 
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
        }
        .score-high { 
            background: linear-gradient(45deg, #f39c12, #e67e22);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
        }
        .score-medium { 
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
        }
        .score-low { 
            background: linear-gradient(45deg, #27ae60, #229954);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
        }
        
        .executive-summary {
            background: linear-gradient(135deg, #74b9ff, #0984e3);
            color: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .executive-summary h2 {
            margin-bottom: 20px;
            font-size: 2em;
        }
        
        .executive-summary .ai-insight {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .vulnerability-list {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .vulnerability-item {
            border: 1px solid #ecf0f1;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .vulnerability-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #ecf0f1;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .vulnerability-header:hover {
            background: #e9ecef;
        }
        
        .vulnerability-title {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .vulnerability-details {
            padding: 20px;
            display: none;
        }
        
        .vulnerability-details.expanded {
            display: block;
        }
        
        .ai-analysis {
            background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .ai-analysis h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .test-results {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .test-pass { color: #27ae60; font-weight: bold; }
        .test-fail { color: #e74c3c; font-weight: bold; }
        
        .footer {
            text-align: center;
            color: white;
            padding: 20px;
            opacity: 0.8;
        }
        
        .toggle-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .confidence-high { color: #27ae60; }
        .confidence-medium { color: #f39c12; }
        .confidence-low { color: #e74c3c; }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2em; }
            .summary-cards { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{reportTitle}}</h1>
            <div class="subtitle">
                Generated on {{formatDate timestamp}}
                {{#if aiEnabled}}
                    <span class="ai-badge">🤖 AI-Enhanced</span>
                    <div style="font-size: 0.9em; margin-top: 5px;">
                        Provider: {{aiProvider}} | Model: {{aiModel}}
                    </div>
                {{/if}}
            </div>
        </div>

        <div class="summary-cards">
            <div class="card">
                <h3>📊 Test Results</h3>
                <div class="metric">
                    <span>Total Tests:</span>
                    <span class="metric-value">{{testSummary.total}}</span>
                </div>
                <div class="metric">
                    <span>Passed:</span>
                    <span class="metric-value test-pass">{{testSummary.passed}}</span>
                </div>
                <div class="metric">
                    <span>Failed:</span>
                    <span class="metric-value test-fail">{{testSummary.failed}}</span>
                </div>
            </div>

            <div class="card">
                <h3>🛡️ Security Findings</h3>
                <div class="metric">
                    <span>Total Alerts:</span>
                    <span class="metric-value">{{securitySummary.totalAlerts}}</span>
                </div>
                <div class="metric">
                    <span>High Risk:</span>
                    <span class="metric-value risk-high">{{securitySummary.high}}</span>
                </div>
                <div class="metric">
                    <span>Medium Risk:</span>
                    <span class="metric-value risk-medium">{{securitySummary.medium}}</span>
                </div>
                <div class="metric">
                    <span>Low Risk:</span>
                    <span class="metric-value risk-low">{{securitySummary.low}}</span>
                </div>
            </div>

            {{#if aiEnabled}}
            <div class="card">
                <h3>🤖 AI Analysis</h3>
                <div class="metric">
                    <span>Risk Score:</span>
                    <span class="metric-value {{riskScoreClass overallRiskScore}}">{{overallRiskScore}}/10</span>
                </div>
                <div class="metric">
                    <span>False Positives:</span>
                    <span class="metric-value">{{length falsePositives}}</span>
                </div>
                <div class="metric">
                    <span>AI Insights:</span>
                    <span class="metric-value">{{length vulnerabilities}} analyzed</span>
                </div>
            </div>
            {{/if}}

            <div class="card">
                <h3>⏱️ Performance</h3>
                <div class="metric">
                    <span>Total Duration:</span>
                    <span class="metric-value">{{formatNumber testSummary.duration}}ms</span>
                </div>
                <div class="metric">
                    <span>Scan Time:</span>
                    <span class="metric-value">{{scanDuration}}s</span>
                </div>
            </div>

            {{#if zapConfig}}
            <div class="card">
                <h3>🔧 Scan Configuration</h3>
                <div class="metric">
                    <span>Security Tool:</span>
                    <span class="metric-value">{{zapConfig.scanTool}} {{zapConfig.version}}</span>
                </div>
                <div class="metric">
                    <span>Scan Mode:</span>
                    <span class="metric-value">{{zapConfig.mode}}</span>
                </div>
                <div class="metric">
                    <span>ZAP Host:</span>
                    <span class="metric-value">{{zapConfig.host}}</span>
                </div>
            </div>

            <div class="card">
                <h3>🕷️ Spider Configuration</h3>
                <div class="metric">
                    <span>Spider Enabled:</span>
                    <span class="metric-value {{#if zapConfig.spider.enabled}}test-pass{{else}}test-fail{{/if}}">{{#if zapConfig.spider.enabled}}YES{{else}}NO{{/if}}</span>
                </div>
                {{#if zapConfig.spider.enabled}}
                <div class="metric">
                    <span>Max Depth:</span>
                    <span class="metric-value">{{zapConfig.spider.maxDepth}}</span>
                </div>
                <div class="metric">
                    <span>Max Children:</span>
                    <span class="metric-value">{{zapConfig.spider.maxChildren}}</span>
                </div>
                <div class="metric">
                    <span>Recursive:</span>
                    <span class="metric-value">{{#if zapConfig.spider.recurse}}YES{{else}}NO{{/if}}</span>
                </div>
                {{/if}}
            </div>

            <div class="card">
                <h3>⚡ Active Scan Configuration</h3>
                <div class="metric">
                    <span>Active Scan:</span>
                    <span class="metric-value {{#if zapConfig.activeScan.enabled}}test-pass{{else}}test-fail{{/if}}">{{#if zapConfig.activeScan.enabled}}ENABLED{{else}}DISABLED{{/if}}</span>
                </div>
                {{#if zapConfig.activeScan.enabled}}
                <div class="metric">
                    <span>Scan Policy:</span>
                    <span class="metric-value">{{zapConfig.activeScan.policy}}</span>
                </div>
                <div class="metric">
                    <span>HTTP Method:</span>
                    <span class="metric-value">{{zapConfig.activeScan.method}}</span>
                </div>
                <div class="metric">
                    <span>Recursive:</span>
                    <span class="metric-value">{{#if zapConfig.activeScan.recurse}}YES{{else}}NO{{/if}}</span>
                </div>
                {{/if}}
            </div>

            <div class="card">
                <h3>👁️ Passive Scan Configuration</h3>
                <div class="metric">
                    <span>Passive Scan:</span>
                    <span class="metric-value {{#if zapConfig.passiveScan.enabled}}test-pass{{else}}test-fail{{/if}}">{{#if zapConfig.passiveScan.enabled}}ENABLED{{else}}DISABLED{{/if}}</span>
                </div>
                <div class="metric">
                    <span>Proxy Mode:</span>
                    <span class="metric-value">{{zapConfig.proxy.protocol}}://{{zapConfig.proxy.host}}:{{zapConfig.proxy.port}}</span>
                </div>
            </div>
            {{/if}}
        </div>

        {{#if aiEnabled}}
        {{#if executiveSummary}}
        <div class="executive-summary">
            <h2>🤖 Executive Summary</h2>
            <div class="ai-insight">
                <h4>Overall Security Posture</h4>
                <p>{{executiveSummary.overallPosture}}</p>
            </div>
            <div class="ai-insight">
                <h4>Key Business Risks</h4>
                <p>{{executiveSummary.keyRisks}}</p>
            </div>
            <div class="ai-insight">
                <h4>Immediate Actions Required</h4>
                <p>{{executiveSummary.immediateActions}}</p>
            </div>
            <div class="ai-insight">
                <h4>Strategic Recommendations</h4>
                <p>{{executiveSummary.recommendations}}</p>
            </div>
        </div>
        {{/if}}
        {{/if}}

        <div class="test-results">
            <h2>🎭 Test Execution Results</h2>
            {{#each testResults}}
            <div class="test-item">
                <div>
                    <strong>{{scenario}}</strong>
                    <div style="font-size: 0.9em; color: #666;">
                        Duration: {{duration}}ms | {{formatDate timestamp}}
                    </div>
                </div>
                <div class="{{#ifEquals status 'PASS'}}test-pass{{else}}test-fail{{/ifEquals}}">
                    {{status}}
                </div>
            </div>
            {{/each}}
        </div>

        <div class="vulnerability-list">
            <h2>🔍 Security Vulnerabilities</h2>
            {{#each vulnerabilities}}
            <div class="vulnerability-item">
                <div class="vulnerability-header" onclick="toggleDetails({{@index}})">
                    <div>
                        <div class="vulnerability-title">{{alert}}</div>
                        <div style="font-size: 0.9em; color: #666;">{{description}}</div>
                    </div>
                    <div>
                        <span class="{{riskClass risk}}">{{risk}}</span>
                        <button class="toggle-btn" id="btn-{{@index}}">Show Details</button>
                    </div>
                </div>
                <div class="vulnerability-details" id="details-{{@index}}">
                    <div><strong>URL:</strong> {{url}}</div>
                    <div><strong>Parameter:</strong> {{param}}</div>
                    <div><strong>Evidence:</strong> {{evidence}}</div>
                    <div><strong>Solution:</strong> {{solution}}</div>
                    <div><strong>Reference:</strong> {{reference}}</div>
                    
                    {{#if aiAnalysis}}
                    <div class="ai-analysis">
                        <h4>🤖 AI-Enhanced Analysis</h4>
                        <div><strong>Business Impact:</strong> {{aiAnalysis.businessImpact}}</div>
                        <div><strong>Risk Score:</strong> <span class="{{riskScoreClass aiAnalysis.businessRiskScore}}">{{aiAnalysis.businessRiskScore}}/10</span></div>
                        <div><strong>False Positive Likelihood:</strong> <span class="{{confidenceClass aiAnalysis.falsePositiveScore}}">{{formatPercent aiAnalysis.falsePositiveScore}}</span></div>
                        {{#if aiAnalysis.remediationSteps}}
                        <div><strong>AI Remediation Steps:</strong></div>
                        <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 5px; margin-top: 5px;">
                            {{aiAnalysis.remediationSteps}}
                        </div>
                        {{/if}}
                    </div>
                    {{/if}}
                </div>
            </div>
            {{/each}}
        </div>

        <div class="footer">
            <p>Generated by AI-Enhanced Security Test Framework</p>
            <p>Powered by Playwright + OWASP ZAP{{#if aiEnabled}} + {{aiProvider}} ({{aiModel}}){{/if}}</p>
        </div>
    </div>

    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            const btn = document.getElementById('btn-' + index);
            
            if (details.classList.contains('expanded')) {
                details.classList.remove('expanded');
                btn.textContent = 'Show Details';
            } else {
                details.classList.add('expanded');
                btn.textContent = 'Hide Details';
            }
        }
    </script>
</body>
</html>
    `;
  }

  /**
   * Generates the main security assessment report in HTML format
   * This is the primary report generation method that creates comprehensive reports
   * 
   * @async
   * @param {Object} data - Report data object containing all scan results and analysis
   * @param {Object} data.testSummary - Test execution summary with counts and duration
   * @param {Array} data.testResults - Individual test results and outcomes
   * @param {Object} data.securitySummary - Security vulnerability counts by severity
   * @param {Array} data.vulnerabilities - Detailed vulnerability information
   * @param {string} data.executiveSummary - AI-generated executive summary
   * @param {number} data.overallRiskScore - Calculated overall security risk score
   * @returns {Promise<string>} The file path of the generated HTML report
   * @throws {Error} If report generation fails
   * 
   * @description Features:
   * - Combines ZAP scan results with AI analysis
   * - Creates executive and technical sections
   * - Includes evidence, solutions, and remediation steps
   * - Generates responsive HTML with interactive elements
   * - Saves both HTML and JSON versions of the report
   * 
   * @example
   * const reportPath = await reportGenerator.generateReport({
   *   vulnerabilities: zapAlerts,
   *   executiveSummary: aiSummary,
   *   overallRiskScore: 85
   * });
   */
  async generateReport(data) {
    try {
      this.log('Generating security assessment report...', 'info');
      
      this.registerHandlebarsHelpers();
      
      const template = await this.getHtmlTemplate();
      const compiledTemplate = Handlebars.compile(template);
      
      const reportData = {
        reportTitle: config.reporting.branding.title,
        timestamp: new Date().toISOString(),
        aiEnabled: config.ai.enabled,
        aiProvider: config.ai.enabled ? config.ai.provider.toUpperCase() : null,
        aiModel: config.ai.enabled ? config.ai.model : null,
        testSummary: data.testSummary || { total: 0, passed: 0, failed: 0, duration: 0 },
        testResults: data.testResults || [],
        securitySummary: data.securitySummary || { totalAlerts: 0, high: 0, medium: 0, low: 0 },
        vulnerabilities: data.vulnerabilities || [],
        executiveSummary: data.executiveSummary || null,
        overallRiskScore: data.overallRiskScore || 0,
        falsePositives: data.falsePositives || [],
        scanDuration: data.scanDuration || 0,
        // ZAP scan configuration details
        zapConfig: {
          scanTool: 'OWASP ZAP',
          version: data.zapVersion || 'Unknown',
          mode: config.zap.mode,
          host: `${config.zap.api.host}:${config.zap.api.port}`,
          spider: {
            enabled: config.zap.spider.enabled,
            maxDepth: config.zap.spider.maxDepth,
            maxChildren: config.zap.spider.maxChildren,
            recurse: config.zap.spider.recurse
          },
          activeScan: {
            enabled: config.zap.activeScan.enabled,
            policy: config.zap.activeScan.scanPolicyName,
            method: config.zap.activeScan.method,
            recurse: config.zap.activeScan.recurse
          },
          passiveScan: {
            enabled: config.zap.passiveScan.enabled
          },
          proxy: {
            host: config.zap.proxy.host,
            port: config.zap.proxy.port,
            protocol: config.zap.proxy.protocol
          }
        },
        ...data
      };
      
      const htmlContent = compiledTemplate(reportData);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `security-assessment-${timestamp}.html`;
      const filePath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filePath, htmlContent, 'utf-8');
      
      // Also generate JSON report
      if (config.reporting.formats.includes('json')) {
        const jsonFilename = `security-assessment-${timestamp}.json`;
        const jsonPath = path.join(this.outputDir, jsonFilename);
        await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8');
        this.log(`JSON report saved: ${jsonPath}`, 'success');
      }
      
      this.log(`HTML report generated successfully: ${filePath}`, 'success');
      
      const result = { htmlPath: filePath };
      
      // Also generate JSON report if requested
      if (config.reporting.formats.includes('json')) {
        const jsonFilename = `security-assessment-${timestamp}.json`;
        const jsonPath = path.join(this.outputDir, jsonFilename);
        await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8');
        this.log(`JSON report saved: ${jsonPath}`, 'success');
        result.jsonPath = jsonPath;
      }
      
      return result;
      
    } catch (error) {
      this.log(`Report generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async createTemplate() {
    try {
      const templatePath = path.join(this.templateDir, 'report.hbs');
      const template = this.getDefaultHtmlTemplate();
      
      await fs.ensureDir(this.templateDir);
      await fs.writeFile(templatePath, template, 'utf-8');
      
      this.log(`Template created: ${templatePath}`, 'success');
      return templatePath;
    } catch (error) {
      this.log(`Failed to create template: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateQuickSummary(data) {
    const summary = {
      timestamp: new Date().toISOString(),
      testResults: {
        total: data.testSummary?.total || 0,
        passed: data.testSummary?.passed || 0,
        failed: data.testSummary?.failed || 0,
        passRate: data.testSummary?.total > 0 ? ((data.testSummary.passed / data.testSummary.total) * 100).toFixed(1) : 0
      },
      securityFindings: {
        total: data.securitySummary?.totalAlerts || 0,
        high: data.securitySummary?.high || 0,
        medium: data.securitySummary?.medium || 0,
        low: data.securitySummary?.low || 0
      },
      riskScore: data.overallRiskScore || 0,
      aiEnhanced: config.ai.enabled,
      falsePositivesDetected: data.falsePositives?.length || 0
    };

    this.log(`Quick Summary - Tests: ${summary.testResults.passed}/${summary.testResults.total} passed, Security: ${summary.securityFindings.total} findings (${summary.securityFindings.high} high risk)`, 'info');
    
    return summary;
  }
}

module.exports = ReportGenerator;
