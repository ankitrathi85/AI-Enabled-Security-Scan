const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const config = require('../config/config');

class AIAnalyzer {
  constructor() {
    this.client = null;
    this.isEnabled = config.ai.enabled;
    this.provider = config.ai.provider;
    this.model = config.ai.model;
    
    if (this.isEnabled) {
      try {
        if (this.provider === 'openai') {
          this.client = new OpenAI({
            apiKey: config.ai.apiKey,
            timeout: config.ai.prompts.timeout
          });
        } else if (this.provider === 'groq') {
          this.client = new OpenAI({
            apiKey: config.ai.apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
            timeout: config.ai.prompts.timeout
          });
        }
      } catch (error) {
        this.log(`Failed to initialize ${this.provider} client: ${error.message}`, 'error');
        this.isEnabled = false;
      }
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = chalk.magenta('[AI]');
    
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

  async loadPromptTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '..', 'prompts', `${templateName}.txt`);
      if (await fs.pathExists(templatePath)) {
        return await fs.readFile(templatePath, 'utf-8');
      }
      return this.getDefaultPrompt(templateName);
    } catch (error) {
      this.log(`Failed to load prompt template ${templateName}: ${error.message}`, 'error');
      return this.getDefaultPrompt(templateName);
    }
  }

  getDefaultPrompt(templateName) {
    const prompts = {
      'vulnerability-analysis': `
        You are a cybersecurity expert analyzing vulnerability scan results. 
        Please analyze the following security vulnerability and provide:
        
        1. BUSINESS IMPACT: Explain in business terms what this vulnerability means
        2. TECHNICAL SEVERITY: Rate the technical severity (Critical/High/Medium/Low) with justification
        3. EXPLOITATION LIKELIHOOD: How likely is this vulnerability to be exploited?
        4. FALSE POSITIVE ASSESSMENT: Rate the likelihood this is a false positive (0-100%)
        5. REMEDIATION STEPS: Specific, actionable steps to fix this vulnerability
        6. CODE EXAMPLES: If applicable, provide before/after code examples
        7. BUSINESS RISK SCORE: Overall risk score (0-10) considering all factors
        
        Vulnerability to analyze:
        {{vulnerability}}
        
        Provide your analysis in a structured format that can be easily parsed.
      `,
      'executive-summary': `
        You are a cybersecurity consultant preparing an executive summary for business stakeholders.
        Based on the security scan results, provide a concise executive summary that includes:
        
        1. OVERALL SECURITY POSTURE: High-level assessment
        2. KEY RISKS: Top 3-5 most critical security risks identified
        3. BUSINESS IMPACT: Potential financial and operational impacts
        4. IMMEDIATE ACTIONS: Priority actions that need to be taken
        5. RECOMMENDATIONS: Strategic security improvements
        6. TIMELINE: Suggested timeline for addressing issues
        
        Security scan results:
        {{scanResults}}
        
        Keep the summary business-focused and avoid technical jargon.
      `,
      'remediation-suggestions': `
        You are a senior application security engineer. Provide detailed remediation guidance for the following vulnerability:
        
        Vulnerability: {{vulnerability}}
        
        Please provide:
        1. ROOT CAUSE: Why this vulnerability exists
        2. IMMEDIATE FIXES: Quick fixes to implement right away
        3. LONG-TERM SOLUTIONS: Comprehensive solutions to prevent recurrence
        4. CODE EXAMPLES: Specific code changes with before/after examples
        5. TESTING STRATEGY: How to test that the fix works
        6. PREVENTION MEASURES: How to prevent this type of vulnerability in the future
        
        Focus on practical, implementable solutions.
      `
    };
    
    return prompts[templateName] || 'Analyze the following security data: {{data}}';
  }

  async makeAIRequest(prompt, maxTokens = config.ai.prompts.maxTokens) {
    if (!this.isEnabled || !this.client) {
      this.log('AI analysis disabled or not configured', 'warn');
      return null;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst with deep knowledge of application security, vulnerability assessment, and business risk analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: config.ai.prompts.temperature
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      this.log(`AI request failed: ${error.message}`, 'error');
      return null;
    }
  }

  async analyzeVulnerability(vulnerability) {
    if (!this.isEnabled) return vulnerability;

    try {
      this.log(`Analyzing vulnerability: ${vulnerability.alert || vulnerability.name}`, 'info');
      
      const template = await this.loadPromptTemplate('vulnerability-analysis');
      const prompt = template.replace('{{vulnerability}}', JSON.stringify(vulnerability, null, 2));
      
      const analysis = await this.makeAIRequest(prompt);
      
      if (analysis) {
        return {
          ...vulnerability,
          aiAnalysis: {
            businessImpact: this.extractSection(analysis, 'BUSINESS IMPACT'),
            technicalSeverity: this.extractSection(analysis, 'TECHNICAL SEVERITY'),
            exploitationLikelihood: this.extractSection(analysis, 'EXPLOITATION LIKELIHOOD'),
            falsePositiveScore: this.extractSection(analysis, 'FALSE POSITIVE ASSESSMENT'),
            remediationSteps: this.extractSection(analysis, 'REMEDIATION STEPS'),
            codeExamples: this.extractSection(analysis, 'CODE EXAMPLES'),
            businessRiskScore: this.extractSection(analysis, 'BUSINESS RISK SCORE'),
            fullAnalysis: analysis,
            analyzedAt: new Date().toISOString()
          }
        };
      }
      
      return vulnerability;
    } catch (error) {
      this.log(`Vulnerability analysis failed: ${error.message}`, 'error');
      return vulnerability;
    }
  }

  async analyzeVulnerabilities(vulnerabilities) {
    if (!this.isEnabled || !vulnerabilities || vulnerabilities.length === 0) {
      return vulnerabilities;
    }

    this.log(`Starting AI analysis of ${vulnerabilities.length} vulnerabilities...`, 'info');
    
    const analyzedVulnerabilities = [];
    
    for (let i = 0; i < vulnerabilities.length; i++) {
      const vulnerability = vulnerabilities[i];
      this.log(`Analyzing vulnerability ${i + 1}/${vulnerabilities.length}: ${vulnerability.alert || vulnerability.name}`, 'info');
      
      const analyzed = await this.analyzeVulnerability(vulnerability);
      analyzedVulnerabilities.push(analyzed);
      
      // Add delay to avoid rate limiting
      if (i < vulnerabilities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.log('Vulnerability analysis completed', 'success');
    return analyzedVulnerabilities;
  }

  async detectFalsePositives(vulnerabilities) {
    if (!this.isEnabled || !vulnerabilities) return [];

    try {
      const potentialFalsePositives = vulnerabilities.filter(vuln => {
        if (vuln.aiAnalysis && vuln.aiAnalysis.falsePositiveScore) {
          const score = this.extractNumericValue(vuln.aiAnalysis.falsePositiveScore);
          return score > 60; // Consider >60% as potential false positive
        }
        return false;
      });

      this.log(`Identified ${potentialFalsePositives.length} potential false positives`, 'info');
      return potentialFalsePositives;
    } catch (error) {
      this.log(`False positive detection failed: ${error.message}`, 'error');
      return [];
    }
  }

  async generateExecutiveSummary(scanResults) {
    if (!this.isEnabled) {
      return {
        summary: 'Executive summary generation is disabled. Enable AI analysis to get detailed summaries.',
        keyPoints: [],
        recommendations: []
      };
    }

    try {
      this.log('Generating executive summary...', 'info');
      
      const template = await this.loadPromptTemplate('executive-summary');
      const prompt = template.replace('{{scanResults}}', JSON.stringify(scanResults, null, 2));
      
      const summary = await this.makeAIRequest(prompt, 1500);
      
      if (summary) {
        return {
          summary,
          overallPosture: this.extractSection(summary, 'OVERALL SECURITY POSTURE'),
          keyRisks: this.extractSection(summary, 'KEY RISKS'),
          businessImpact: this.extractSection(summary, 'BUSINESS IMPACT'),
          immediateActions: this.extractSection(summary, 'IMMEDIATE ACTIONS'),
          recommendations: this.extractSection(summary, 'RECOMMENDATIONS'),
          timeline: this.extractSection(summary, 'TIMELINE'),
          generatedAt: new Date().toISOString()
        };
      }
      
      return { summary: 'Failed to generate executive summary', keyPoints: [], recommendations: [] };
    } catch (error) {
      this.log(`Executive summary generation failed: ${error.message}`, 'error');
      return { summary: 'Executive summary unavailable due to analysis error', keyPoints: [], recommendations: [] };
    }
  }

  async calculateRiskScore(vulnerabilities) {
    if (!vulnerabilities || vulnerabilities.length === 0) return 0;

    try {
      let totalScore = 0;
      let scoredCount = 0;

      vulnerabilities.forEach(vuln => {
        let score = 0;
        
        // Base score from ZAP risk level
        switch (vuln.risk?.toLowerCase()) {
          case 'high':
            score = 8;
            break;
          case 'medium':
            score = 5;
            break;
          case 'low':
            score = 2;
            break;
          case 'informational':
            score = 1;
            break;
          default:
            score = 3;
        }
        
        // Enhance with AI analysis if available
        if (vuln.aiAnalysis && vuln.aiAnalysis.businessRiskScore) {
          const aiScore = this.extractNumericValue(vuln.aiAnalysis.businessRiskScore);
          if (aiScore > 0 && aiScore <= 10) {
            score = (score + aiScore) / 2; // Average ZAP and AI scores
          }
        }
        
        totalScore += score;
        scoredCount++;
      });

      const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;
      return Math.round(averageScore * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      this.log(`Risk score calculation failed: ${error.message}`, 'error');
      return 0;
    }
  }

  async suggestRemediation(vulnerability) {
    if (!this.isEnabled) return null;

    try {
      const template = await this.loadPromptTemplate('remediation-suggestions');
      const prompt = template.replace('{{vulnerability}}', JSON.stringify(vulnerability, null, 2));
      
      const suggestions = await this.makeAIRequest(prompt);
      
      if (suggestions) {
        return {
          rootCause: this.extractSection(suggestions, 'ROOT CAUSE'),
          immediateFixes: this.extractSection(suggestions, 'IMMEDIATE FIXES'),
          longTermSolutions: this.extractSection(suggestions, 'LONG-TERM SOLUTIONS'),
          codeExamples: this.extractSection(suggestions, 'CODE EXAMPLES'),
          testingStrategy: this.extractSection(suggestions, 'TESTING STRATEGY'),
          preventionMeasures: this.extractSection(suggestions, 'PREVENTION MEASURES'),
          fullSuggestions: suggestions,
          generatedAt: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      this.log(`Remediation suggestion failed: ${error.message}`, 'error');
      return null;
    }
  }

  extractSection(text, sectionName) {
    if (!text || !sectionName) return '';
    
    try {
      const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z\\s]+:|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    } catch (error) {
      return '';
    }
  }

  extractNumericValue(text) {
    if (!text) return 0;
    
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getAICapabilities() {
    return {
      enabled: this.isEnabled,
      provider: this.provider,
      model: this.model,
      features: {
        vulnerabilityAnalysis: config.ai.features.vulnerabilityAnalysis && this.isEnabled,
        falsePositiveDetection: config.ai.features.falsePositiveDetection && this.isEnabled,
        riskAssessment: config.ai.features.riskAssessment && this.isEnabled,
        remediation: config.ai.features.remediation && this.isEnabled,
        businessImpact: config.ai.features.businessImpact && this.isEnabled,
        executiveSummary: config.ai.features.executiveSummary && this.isEnabled
      }
    };
  }
}

module.exports = AIAnalyzer;
