const axios = require('axios');
const chalk = require('chalk');
const config = require('../config/config');

class ZAPClient {
  constructor() {
    this.baseURL = `http://${config.zap.api.host}:${config.zap.api.port}`;
    this.apiKey = config.zap.api.key;
    this.sessionId = null;
    this.contextId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = chalk.blue('[ZAP]');
    
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

  async makeRequest(endpoint, params = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const requestParams = {
        ...params,
        ...(this.apiKey && { apikey: this.apiKey })
      };

      this.log(`Making request to: ${endpoint}`, 'info');
      const response = await axios.get(url, { params: requestParams });
      return response.data;
    } catch (error) {
      this.log(`Request failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkZAPStatus() {
    try {
      const response = await this.makeRequest('/JSON/core/view/version/');
      this.log(`ZAP version: ${response.version}`, 'success');
      return true;
    } catch (error) {
      this.log('ZAP is not accessible. Please ensure ZAP is running on localhost:8080', 'error');
      return false;
    }
  }

  async createSession(sessionName = `JuiceShop_${Date.now()}`) {
    try {
      const response = await this.makeRequest('/JSON/core/action/newSession/', {
        name: sessionName,
        overwrite: true
      });
      
      this.sessionId = sessionName;
      this.log(`Created new session: ${sessionName}`, 'success');
      return response;
    } catch (error) {
      this.log(`Failed to create session: ${error.message}`, 'error');
      throw error;
    }
  }

  async setMode(mode = 'safe') {
    try {
      const response = await this.makeRequest('/JSON/core/action/setMode/', { mode });
      this.log(`Set ZAP mode to: ${mode}`, 'success');
      return response;
    } catch (error) {
      this.log(`Failed to set mode: ${error.message}`, 'error');
      throw error;
    }
  }

  async setPassiveScanEnabled(enabled = true) {
    try {
      const response = await this.makeRequest('/JSON/pscan/action/setEnabled/', { 
        enabled: enabled.toString() 
      });
      this.log(`Set passive scanning: ${enabled ? 'enabled' : 'disabled'}`, 'success');
      return response;
    } catch (error) {
      this.log(`Failed to set passive scan mode: ${error.message}`, 'error');
      throw error;
    }
  }

  async getPassiveScanStatus() {
    try {
      const response = await this.makeRequest('/JSON/pscan/view/scanOnlyInScope/');
      return response;
    } catch (error) {
      this.log(`Failed to get passive scan status: ${error.message}`, 'error');
      return null;
    }
  }

  async createContext(contextName = 'JuiceShop') {
    try {
      const response = await this.makeRequest('/JSON/context/action/newContext/', {
        contextName
      });
      
      this.contextId = response.contextId;
      this.log(`Created context: ${contextName} (ID: ${this.contextId})`, 'success');
      return response;
    } catch (error) {
      this.log(`Failed to create context: ${error.message}`, 'error');
      throw error;
    }
  }

  async includeInContext(regex, contextId = this.contextId) {
    try {
      const response = await this.makeRequest('/JSON/context/action/includeInContext/', {
        contextName: 'JuiceShop',
        regex
      });
      
      this.log(`Added regex to context: ${regex}`, 'success');
      return response;
    } catch (error) {
      this.log(`Failed to include in context: ${error.message}`, 'error');
      throw error;
    }
  }

  async startSpider(url, contextId = this.contextId) {
    try {
      // First, ensure the URL is included in context
      await this.includeInContext(`${url}.*`);
      
      // ZAP Spider API expects specific parameter names
      const response = await this.makeRequest('/JSON/spider/action/scan/', {
        url: url,
        maxChildren: String(config.zap.spider.maxChildren || 10),
        recurse: config.zap.spider.recurse ? 'true' : 'false',
        contextName: config.zap.spider.contextName || 'JuiceShop',
        subtreeOnly: 'false'
      });
      
      const scanId = response.scan;
      this.log(`Started spider scan (ID: ${scanId}) for: ${url}`, 'success');
      return scanId;
    } catch (error) {
      this.log(`Failed to start spider: ${error.message}`, 'error');
      
      // Try minimal approach - just URL parameter
      try {
        this.log('Attempting minimal spider scan with just URL...', 'info');
        const response = await this.makeRequest('/JSON/spider/action/scan/', {
          url: url,
          maxChildren: '10',
          recurse: 'true'
        });
        
        const scanId = response.scan;
        this.log(`Started minimal spider scan (ID: ${scanId}) for: ${url}`, 'success');
        return scanId;
      } catch (altError) {
        this.log(`Minimal spider scan also failed: ${altError.message}`, 'error');
        
        // Try absolutely minimal - just URL
        try {
          this.log('Attempting basic spider scan with URL only...', 'info');
          const response = await this.makeRequest('/JSON/spider/action/scan/', {
            url: url
          });
          
          const scanId = response.scan;
          this.log(`Started basic spider scan (ID: ${scanId}) for: ${url}`, 'success');
          return scanId;
        } catch (basicError) {
          this.log(`All spider scan attempts failed: ${basicError.message}`, 'error');
          return null; // Return null instead of throwing to allow framework to continue
        }
      }
    }
  }

  async getSpiderProgress(scanId) {
    try {
      const response = await this.makeRequest('/JSON/spider/view/status/', { scanId });
      return parseInt(response.status);
    } catch (error) {
      this.log(`Failed to get spider progress: ${error.message}`, 'error');
      return -1;
    }
  }

  async waitForSpiderCompletion(scanId, timeoutMs = 300000) {
    this.log('Waiting for spider scan to complete...', 'info');
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const progress = await this.getSpiderProgress(scanId);
      
      if (progress === 100) {
        this.log('Spider scan completed successfully', 'success');
        return true;
      }
      
      if (progress >= 0) {
        this.log(`Spider progress: ${progress}%`, 'info');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
    
    this.log('Spider scan timed out', 'warn');
    return false;
  }

  async startActiveScan(url, contextId = this.contextId) {
    try {
      // ZAP Active Scan API expects specific parameter format
      const response = await this.makeRequest('/JSON/ascan/action/scan/', {
        url: url,
        recurse: config.zap.activeScan.recurse ? 'true' : 'false',
        inScopeOnly: 'false',
        scanPolicyName: config.zap.activeScan.scanPolicyName || 'Default Policy',
        method: config.zap.activeScan.method || 'GET',
        postData: ''
      });
      
      const scanId = response.scan;
      this.log(`Started active scan (ID: ${scanId}) for: ${url}`, 'success');
      return scanId;
    } catch (error) {
      this.log(`Failed to start active scan: ${error.message}`, 'error');
      
      // Try minimal active scan
      try {
        this.log('Attempting minimal active scan...', 'info');
        const response = await this.makeRequest('/JSON/ascan/action/scan/', {
          url: url,
          recurse: 'false',
          inScopeOnly: 'false'
        });
        
        const scanId = response.scan;
        this.log(`Started minimal active scan (ID: ${scanId}) for: ${url}`, 'success');
        return scanId;
      } catch (altError) {
        this.log(`Minimal active scan failed: ${altError.message}`, 'error');
        
        // Try absolutely basic active scan
        try {
          this.log('Attempting basic active scan with URL only...', 'info');
          const response = await this.makeRequest('/JSON/ascan/action/scan/', {
            url: url
          });
          
          const scanId = response.scan;
          this.log(`Started basic active scan (ID: ${scanId}) for: ${url}`, 'success');
          return scanId;
        } catch (basicError) {
          this.log(`All active scan attempts failed: ${basicError.message}`, 'error');
          return null; // Return null instead of throwing to allow framework to continue
        }
      }
    }
  }

  async getActiveScanProgress(scanId) {
    try {
      const response = await this.makeRequest('/JSON/ascan/view/status/', { scanId });
      return parseInt(response.status);
    } catch (error) {
      this.log(`Failed to get active scan progress: ${error.message}`, 'error');
      return -1;
    }
  }

  async waitForActiveScanCompletion(scanId, timeoutMs = 600000) {
    this.log('Waiting for active scan to complete...', 'info');
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const progress = await this.getActiveScanProgress(scanId);
      
      if (progress === 100) {
        this.log('Active scan completed successfully', 'success');
        return true;
      }
      
      if (progress >= 0) {
        this.log(`Active scan progress: ${progress}%`, 'info');
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    this.log('Active scan timed out', 'warn');
    return false;
  }

  async getAlerts() {
    try {
      const response = await this.makeRequest('/JSON/core/view/alerts/');
      const alerts = response.alerts || [];
      
      this.log(`Retrieved ${alerts.length} security alerts`, 'success');
      return alerts;
    } catch (error) {
      this.log(`Failed to get alerts: ${error.message}`, 'error');
      return [];
    }
  }

  async getAlertsCount() {
    try {
      const response = await this.makeRequest('/JSON/core/view/numberOfAlerts/');
      return parseInt(response.numberOfAlerts);
    } catch (error) {
      this.log(`Failed to get alerts count: ${error.message}`, 'error');
      return 0;
    }
  }

  async generateHtmlReport() {
    try {
      const response = await this.makeRequest('/OTHER/core/other/htmlreport/');
      this.log('Generated ZAP HTML report', 'success');
      return response;
    } catch (error) {
      this.log(`Failed to generate HTML report: ${error.message}`, 'error');
      return null;
    }
  }

  async shutdown() {
    try {
      this.log('Shutting down ZAP session...', 'info');
      await this.makeRequest('/JSON/core/action/shutdown/');
      this.log('ZAP shutdown initiated', 'success');
    } catch (error) {
      this.log(`Failed to shutdown ZAP: ${error.message}`, 'error');
    }
  }

  async getScanSummary() {
    try {
      const alerts = await this.getAlerts();
      const summary = {
        totalAlerts: alerts.length,
        high: alerts.filter(a => a.risk === 'High').length,
        medium: alerts.filter(a => a.risk === 'Medium').length,
        low: alerts.filter(a => a.risk === 'Low').length,
        informational: alerts.filter(a => a.risk === 'Informational').length,
        alerts: alerts
      };

      this.log(`Scan Summary - Total: ${summary.totalAlerts}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low}`, 'info');
      return summary;
    } catch (error) {
      this.log(`Failed to get scan summary: ${error.message}`, 'error');
      return null;
    }
  }
}

module.exports = ZAPClient;
