const axios = require('axios');
const chalk = require('chalk');

class OllamaHealthCheck {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async checkOllamaStatus() {
    try {
      console.log(chalk.blue('🦙 Checking Ollama Status...'));
      
      // Check if Ollama is running
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log(chalk.green('✅ Ollama service is running'));
        
        const models = response.data.models || [];
        if (models.length > 0) {
          console.log(chalk.blue('\n📋 Available models:'));
          models.forEach(model => {
            const size = model.size ? `(${(model.size / 1e9).toFixed(1)}GB)` : '';
            console.log(chalk.white(`  • ${model.name} ${size}`));
          });
        } else {
          console.log(chalk.yellow('⚠️  No models found. Run: ollama pull mistral'));
        }
        
        return true;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.red('❌ Ollama service is not running'));
        console.log(chalk.yellow('   Start it with: ollama serve'));
        console.log(chalk.yellow('   Or run our setup script: ./scripts/setup-ollama.sh'));
      } else {
        console.log(chalk.red(`❌ Ollama check failed: ${error.message}`));
      }
      return false;
    }
  }

  async testModel(modelName = 'mistral') {
    try {
      console.log(chalk.blue(`\n🧪 Testing model: ${modelName}`));
      
      const testPrompt = 'Explain what a SQL injection vulnerability is in 2 sentences.';
      
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: modelName,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 100
        }
      }, { timeout: 30000 });

      if (response.data && response.data.response) {
        console.log(chalk.green(`✅ Model ${modelName} is working`));
        console.log(chalk.gray(`Response preview: ${response.data.response.substring(0, 100)}...`));
        return true;
      } else {
        console.log(chalk.red(`❌ Model ${modelName} returned empty response`));
        return false;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(chalk.red(`❌ Model ${modelName} not found`));
        console.log(chalk.yellow(`   Pull it with: ollama pull ${modelName}`));
      } else {
        console.log(chalk.red(`❌ Model test failed: ${error.message}`));
      }
      return false;
    }
  }
}

// CLI usage
if (require.main === module) {
  const checker = new OllamaHealthCheck();
  
  (async () => {
    const isRunning = await checker.checkOllamaStatus();
    
    if (isRunning) {
      // Test the configured model
      const model = process.env.AI_MODEL || 'mistral';
      await checker.testModel(model);
    }
    
    console.log(chalk.blue('\n💡 Configuration tips:'));
    console.log(chalk.white('  • For security analysis: mistral (fastest, good quality)'));
    console.log(chalk.white('  • For code analysis: codellama (specialized for code)'));
    console.log(chalk.white('  • For detailed analysis: llama3 (best quality, slower)'));
  })();
}

module.exports = OllamaHealthCheck;
