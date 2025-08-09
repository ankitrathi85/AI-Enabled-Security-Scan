const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const config = require('../config/config');

/**
 * AI-ENHANCED VULNERABILITY ANALYZER
 * =================================
 * 
 * Multi-provider AI analysis engine for security vulnerability assessment.
 * Supports cloud providers (OpenAI, GROQ, Anthropic) and local LLMs (Ollama).
 * 
 * Provider/Model Selection:
 * - **GROQ**: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768
 * - **OpenAI**: gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview  
 * - **Anthropic**: claude-3-sonnet-20240229, claude-3-haiku-20240307
 * - **Ollama**: Uses any locally installed model (mistral, llama3, codellama, etc.)
 * 
 * Key Features:
 * - Multi-provider AI support with automatic fallback
 * - Intelligent vulnerability analysis with business impact assessment
 * - False positive detection and risk scoring
 * - Rate limiting and batch processing for optimal performance
 * - Executive summary generation for business stakeholders
 * 
 * Configuration:
 * - Set AI_PROVIDER to choose provider (groq, openai, anthropic, ollama)
 * - Set AI_MODEL to choose specific model for cloud providers
 * - For Ollama, AI_MODEL specifies which local model to use
 */
class AIAnalyzer {
  /**
   * Initialize the AI analyzer with configured provider
   * Sets up the appropriate client based on the selected AI provider
   * 
   * @constructor
   */
  constructor() {
    this.client = null;
    this.isEnabled = config.ai.enabled;
    this.provider = config.ai.provider;
    this.model = config.ai.model;
    
    if (this.isEnabled) {
      this._initializeAIClient();
    }
  }

  /**
   * Initialize the appropriate AI client based on provider configuration
   * Handles setup for OpenAI, GROQ, Anthropic, and Ollama providers
   * 
   * @private
   */
  _initializeAIClient() {
    try {
      this.log(`Initializing AI client for provider: ${this.provider} with model: ${this.model}`, 'info');
      
      switch (this.provider) {
        case 'openai':
          this.client = new OpenAI({
            apiKey: config.ai.apiKey,
            timeout: config.ai.prompts.timeout
          });
          this.log(`OpenAI client initialized with model: ${this.model}`, 'success');
          break;
          
        case 'groq':
          this.client = new OpenAI({
            apiKey: config.ai.apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
            timeout: config.ai.prompts.timeout
          });
          this.log(`GROQ client initialized with model: ${this.model}`, 'success');
          break;
          
        case 'anthropic':
          // Anthropic integration would go here
          this.log('Anthropic provider configured (implementation pending)', 'info');
          break;
          
        case 'ollama':
          // Ollama uses direct HTTP calls, no OpenAI client needed
          this.ollamaBaseUrl = config.ai.ollama.baseUrl;
          this.log(`Ollama client initialized with model: ${this.model} at ${this.ollamaBaseUrl}`, 'success');
          break;
          
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      this.log(`Failed to initialize ${this.provider} client: ${error.message}`, 'error');
      this.isEnabled = false;
    }
  }

  /**
   * Centralized logging function with timestamp and color coding
   * Provides consistent logging across all AI analyzer operations
   * 
   * @param {string} message - The message to log
   * @param {string} type - Log level: 'info', 'warn', 'error', 'success'
   */
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

  /**
   * Load AI prompt template from file system
   * Attempts to load custom prompt templates from the prompts/ directory
   * Falls back to default built-in prompts if file not found
   * 
   * @async
   * @param {string} templateName - Name of the template file (without .txt extension)
   * @returns {Promise<string>} The prompt template content
   * 
   * @example
   * const template = await analyzer.loadPromptTemplate('vulnerability-analysis');
   */
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

  /**
   * Get default built-in prompt templates
   * Provides fallback prompts when external template files are not available
   * Contains specialized prompts for different analysis types
   * 
   * @param {string} templateName - Name of the prompt template
   * @returns {string} Default prompt template content
   * 
   * Available templates:
   * - vulnerability-analysis: Comprehensive vulnerability assessment
   * - executive-summary: Business-focused summary generation  
   * - remediation-suggestions: Detailed fix recommendations
   */
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

  /**
   * Make AI request to the configured provider
   * Handles requests to both cloud providers (OpenAI, GROQ) and local Ollama
   * Includes appropriate error handling and timeout management
   * 
   * @async
   * @param {string} prompt - The prompt to send to the AI
   * @param {number} maxTokens - Maximum tokens for the response
   * @returns {Promise<string|null>} AI response content or null if failed
   * 
   * @example
   * const analysis = await analyzer.makeAIRequest(
   *   "Analyze this SQL injection vulnerability...", 
   *   1000
   * );
   */
  async makeAIRequest(prompt, maxTokens = config.ai.prompts.maxTokens) {
    if (!this.isEnabled) {
      this.log('AI analysis disabled or not configured', 'warn');
      return null;
    }

    try {
      if (this.provider === 'ollama') {
        return await this.makeOllamaRequest(prompt, maxTokens);
      } else if (this.client) {
        this.log(`Making ${this.provider.toUpperCase()} API request with model: ${this.model}`, 'info');
        
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
      } else {
        this.log('No AI client available', 'warn');
        return null;
      }
    } catch (error) {
      this.log(`AI request failed: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Make request to Ollama local LLM server
   * Handles communication with locally hosted Ollama models
   * Provides optimized settings for local processing
   * 
   * @async  
   * @param {string} prompt - The prompt to send to Ollama
   * @param {number} maxTokens - Maximum tokens for response generation
   * @returns {Promise<string|null>} Generated response or null if failed
   * 
   * Features:
   * - Direct HTTP API communication with Ollama server
   * - Optimized parameters for local model performance
   * - Comprehensive error handling for connection issues
   * - Model availability validation
   */
  async makeOllamaRequest(prompt, maxTokens) {
    try {
      this.log(`Making Ollama request to ${this.ollamaBaseUrl} with model ${this.model}`, 'info');
      
      const systemPrompt = 'You are an expert cybersecurity analyst with deep knowledge of application security, vulnerability assessment, and business risk analysis.';
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: config.ai.prompts.temperature,
          num_predict: maxTokens > 0 ? maxTokens : 2000, // Ollama uses num_predict instead of max_tokens
          top_p: 0.9,
          top_k: 40
        }
      }, {
        timeout: config.ai.prompts.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        this.log(`Ollama request successful, response length: ${response.data.response.length}`, 'info');
        return response.data.response;
      } else {
        this.log('Ollama returned empty response', 'warn');
        return null;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.log('Ollama server not running. Please start Ollama with: ollama serve', 'error');
      } else if (error.response?.status === 404) {
        this.log(`Model ${this.model} not found. Please pull it with: ollama pull ${this.model}`, 'error');
      } else {
        this.log(`Ollama request failed: ${error.message}`, 'error');
      }
      return null;
    }
  }

  /**
   * Analyze individual vulnerability with AI enhancement
   * Performs comprehensive AI analysis of a single security vulnerability
   * Extracts business impact, severity, remediation steps, and risk scores
   * 
   * @async
   * @param {Object} vulnerability - Vulnerability object from ZAP scan
   * @param {string} vulnerability.alert - Vulnerability name/title
   * @param {string} vulnerability.risk - Risk level (High/Medium/Low) 
   * @param {string} vulnerability.description - Technical description
   * @param {string} vulnerability.url - Affected URL
   * @param {string} vulnerability.evidence - Evidence of the vulnerability
   * @param {string} vulnerability.solution - Basic remediation advice
   * @returns {Promise<Object>} Enhanced vulnerability with AI analysis
   * 
   * AI Enhancement includes:
   * - Business impact assessment
   * - Technical severity analysis  
   * - False positive likelihood scoring
   * - Detailed remediation steps
   * - Business risk score (0-10)
   * - Code examples for fixes
   */
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

  /**
   * Analyze multiple vulnerabilities with intelligent processing
   * Implements advanced strategies for efficient bulk vulnerability analysis
   * Includes prioritization, rate limiting, and batch processing
   * 
   * @async
   * @param {Array<Object>} vulnerabilities - Array of vulnerability objects
   * @returns {Promise<Array<Object>>} Array of AI-enhanced vulnerabilities
   * 
   * Processing Strategies:
   * 1. SMART PRIORITIZATION - High/Medium risk vulnerabilities analyzed first
   * 2. RATE LIMIT PROTECTION - Respects API limits with configurable thresholds  
   * 3. BATCH PROCESSING - Groups vulnerabilities for efficient processing
   * 4. ADAPTIVE DELAYS - Provider-specific delays to prevent rate limiting
   * 5. GRACEFUL DEGRADATION - Falls back to unanalyzed vulnerabilities if needed
   * 
   * Configuration (via environment):
   * - AI_MAX_VULNERABILITIES: Maximum vulnerabilities to analyze
   * - AI_BATCH_SIZE: Vulnerabilities per batch
   * - AI_DELAY_MS: Delay between individual requests  
   * - AI_BATCH_DELAY_MS: Delay between batches
   */
  async analyzeVulnerabilities(vulnerabilities) {
    if (!this.isEnabled || !vulnerabilities || vulnerabilities.length === 0) {
      return vulnerabilities;
    }

    this.log(`Starting AI analysis of ${vulnerabilities.length} vulnerabilities...`, 'info');
    
    // STRATEGY 1: Smart prioritization - analyze high/medium risk first
    const prioritized = this.prioritizeVulnerabilities(vulnerabilities);
    
    // STRATEGY 2: Rate limit protection - analyze in smaller batches
    const batchSize = config.ai.rateLimits.batchSize;
    const maxAnalyze = Math.min(prioritized.length, config.ai.rateLimits.maxVulnerabilities);
    
    if (prioritized.length > maxAnalyze) {
      this.log(`Rate limit protection: Analyzing top ${maxAnalyze} of ${prioritized.length} vulnerabilities`, 'warn');
    }
    
    const toAnalyze = prioritized.slice(0, maxAnalyze);
    const analyzedVulnerabilities = [];
    
    for (let i = 0; i < toAnalyze.length; i += batchSize) {
      const batch = toAnalyze.slice(i, i + batchSize);
      this.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toAnalyze.length / batchSize)}`, 'info');
      
      for (const vulnerability of batch) {
        try {
          this.log(`Analyzing vulnerability ${analyzedVulnerabilities.length + 1}/${toAnalyze.length}: ${vulnerability.alert || vulnerability.name}`, 'info');
          
          const analyzed = await this.analyzeVulnerability(vulnerability);
          analyzedVulnerabilities.push(analyzed);
          
          // Configurable delay between requests
          await new Promise(resolve => setTimeout(resolve, config.ai.rateLimits.delayBetweenRequests));
          
        } catch (error) {
          this.log(`Failed to analyze vulnerability: ${error.message}`, 'warn');
          analyzedVulnerabilities.push(vulnerability); // Add unanalyzed version
        }
      }
      
      // Configurable delay between batches
      if (i + batchSize < toAnalyze.length) {
        this.log('Waiting to avoid rate limits...', 'info');
        await new Promise(resolve => setTimeout(resolve, config.ai.rateLimits.delayBetweenBatches));
      }
    }
    
    // Add remaining unanalyzed vulnerabilities
    const remaining = vulnerabilities.slice(maxAnalyze);
    analyzedVulnerabilities.push(...remaining);
    
    this.log('Vulnerability analysis completed', 'success');
    return analyzedVulnerabilities;
  }

  /**
   * Prioritize vulnerabilities by risk level for optimal analysis order
   * Ensures high-impact vulnerabilities are analyzed first when rate limits apply
   * Uses intelligent scoring system based on ZAP risk classifications
   * 
   * @param {Array<Object>} vulnerabilities - Array of vulnerability objects  
   * @returns {Array<Object>} Vulnerabilities sorted by priority (highest first)
   * 
   * Priority Order:
   * 1. High Risk (Score: 4) - Critical security issues requiring immediate attention
   * 2. Medium Risk (Score: 3) - Important issues that should be addressed soon  
   * 3. Low Risk (Score: 2) - Minor issues for future remediation
   * 4. Informational (Score: 1) - Documentation and best practice recommendations
   * 
   * This ensures that when AI analysis is rate-limited, the most critical 
   * vulnerabilities receive AI enhancement first.
   */
  prioritizeVulnerabilities(vulnerabilities) {
    // Sort by risk level: High > Medium > Low > Informational
    const riskOrder = { 'high': 4, 'medium': 3, 'low': 2, 'informational': 1 };
    
    return vulnerabilities.sort((a, b) => {
      const aRisk = riskOrder[a.risk?.toLowerCase()] || 0;
      const bRisk = riskOrder[b.risk?.toLowerCase()] || 0;
      return bRisk - aRisk; // Descending order (high risk first)
    });
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

  /**
   * Generate AI-powered executive summary for business stakeholders
   * Creates high-level security assessment summary with business focus
   * Automatically handles large datasets through smart condensation strategies
   * 
   * @async  
   * @param {Object} scanResults - Complete scan results data
   * @param {number} scanResults.totalFindings - Total number of security findings
   * @param {Object} scanResults.riskBreakdown - Breakdown by risk level
   * @param {Array} scanResults.findings - Array of vulnerability findings
   * @param {Object} scanResults.testResults - Test execution results
   * @returns {Promise<Object>} Executive summary with business insights
   * 
   * Generated Summary Contains:
   * - OVERALL SECURITY POSTURE: High-level assessment
   * - KEY BUSINESS RISKS: Top 3-5 most critical security risks  
   * - BUSINESS IMPACT: Potential financial and operational impacts
   * - IMMEDIATE ACTIONS: Priority actions requiring immediate attention
   * - STRATEGIC RECOMMENDATIONS: Long-term security improvements
   * - TIMELINE: Suggested remediation timeline
   * 
   * Features:
   * - Smart data condensation for large datasets
   * - Token usage estimation with automatic fallback
   * - Business-focused language avoiding technical jargon
   * - Risk-based prioritization of issues
   */
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
      
      // STRATEGY 3: Smart summarization - use condensed data for executive summary
      const condensedResults = this.condenseScanResults(scanResults);
      
      const template = await this.loadPromptTemplate('executive-summary');
      const prompt = template.replace('{{scanResults}}', JSON.stringify(condensedResults, null, 2));
      
      // STRATEGY 4: Estimate token usage and adjust
      const estimatedTokens = this.estimateTokens(prompt);
      this.log(`Estimated tokens for executive summary: ${estimatedTokens}`, 'info');
      
      // If too large, use fallback strategy
      if (estimatedTokens > config.ai.fallback.tokenLimit && config.ai.fallback.enableRuleBasedSummary) {
        this.log('Using fallback summary generation for large dataset', 'warn');
        return this.generateFallbackSummary(scanResults);
      }
      
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
          generatedAt: new Date().toISOString(),
          method: 'ai-generated'
        };
      }
      
      // Fallback if AI request fails
      return this.generateFallbackSummary(scanResults);
      
    } catch (error) {
      this.log(`Executive summary generation failed: ${error.message}`, 'error');
      return this.generateFallbackSummary(scanResults);
    }
  }

  condenseScanResults(scanResults) {
    // Create a condensed version with only essential data
    return {
      totalFindings: scanResults.totalFindings || 0,
      riskBreakdown: scanResults.riskBreakdown || {},
      testResults: {
        passed: scanResults.testResults?.passed || 0,
        failed: scanResults.testResults?.failed || 0,
        total: scanResults.testResults?.total || 0
      },
      topFindings: (scanResults.findings || [])
        .filter(f => f.risk === 'High' || f.risk === 'Medium')
        .slice(0, 10)
        .map(f => ({
          alert: f.alert,
          risk: f.risk,
          confidence: f.confidence,
          url: f.url,
          description: f.description?.substring(0, 200) + '...' // Truncate long descriptions
        })),
      duration: scanResults.duration,
      timestamp: scanResults.timestamp
    };
  }

  generateFallbackSummary(scanResults) {
    // Generate a summary without AI when tokens are too large
    const total = scanResults.totalFindings || 0;
    const high = scanResults.riskBreakdown?.High || 0;
    const medium = scanResults.riskBreakdown?.Medium || 0;
    const low = scanResults.riskBreakdown?.Low || 0;
    
    let posture = 'Good';
    let riskLevel = 'Low';
    
    if (high > 3) {
      posture = 'Critical Issues Identified';
      riskLevel = 'High';
    } else if (high > 0 || medium > 5) {
      posture = 'Security Concerns Present';
      riskLevel = 'Medium';
    } else if (medium > 0 || low > 10) {
      posture = 'Minor Issues Detected';
      riskLevel = 'Low';
    }
    
    const summary = `Security assessment completed with ${total} total findings. Overall security posture: ${posture}. 
    Risk breakdown: ${high} high-risk, ${medium} medium-risk, and ${low} low-risk vulnerabilities identified.
    ${high > 0 ? 'Immediate attention required for high-risk vulnerabilities.' : ''}
    ${medium > 3 ? 'Medium-risk issues should be addressed in the next development cycle.' : ''}`;
    
    return {
      summary,
      overallPosture: posture,
      keyRisks: high > 0 ? 'High-risk vulnerabilities require immediate attention' : 'No critical risks identified',
      businessImpact: riskLevel === 'High' ? 'Potential for significant business impact' : 'Limited business impact expected',
      immediateActions: high > 0 ? 'Address high-risk vulnerabilities immediately' : 'Review and plan remediation for identified issues',
      recommendations: 'Implement security best practices and regular vulnerability assessments',
      timeline: high > 0 ? 'High-risk: Immediate, Medium-risk: 30 days, Low-risk: 90 days' : 'Address issues within standard development cycles',
      generatedAt: new Date().toISOString(),
      method: 'rule-based-fallback'
    };
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
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
