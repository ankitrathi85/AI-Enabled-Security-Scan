#!/bin/bash

# Ollama Setup Script for AI-Enhanced Security Framework
echo "🦙 Setting up Ollama for Local AI Analysis"
echo "=========================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   macOS: brew install ollama"
    echo "   Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "   Windows: Download from https://ollama.com/download/windows"
    exit 1
fi

echo "✅ Ollama is installed"

# Check if Ollama service is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🚀 Starting Ollama service..."
    ollama serve &
    sleep 3
    
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "❌ Failed to start Ollama service"
        echo "   Try running: ollama serve"
        exit 1
    fi
fi

echo "✅ Ollama service is running"

# Function to pull model if not exists
pull_model_if_needed() {
    local model=$1
    local description=$2
    
    if ollama list | grep -q "^$model"; then
        echo "✅ $model ($description) is already available"
    else
        echo "📥 Pulling $model ($description)..."
        if ollama pull "$model"; then
            echo "✅ Successfully pulled $model"
        else
            echo "❌ Failed to pull $model"
            return 1
        fi
    fi
}

# Pull recommended models for security analysis
echo ""
echo "📥 Setting up recommended models for security analysis:"
echo ""

# Mistral - Great for general security analysis
pull_model_if_needed "mistral" "General purpose model, excellent for security analysis"

# CodeLlama - Specialized for code analysis
pull_model_if_needed "codellama" "Code-specialized model for vulnerability analysis"

# Llama3 - Latest and most capable
if pull_model_if_needed "llama3" "Most advanced model for complex analysis"; then
    echo "✅ Llama3 available"
else
    echo "⚠️  Llama3 failed to pull, but mistral and codellama should work fine"
fi

echo ""
echo "🎯 Model Recommendations:"
echo "  • mistral      - Best all-around for security analysis (7B params, ~4GB)"
echo "  • codellama    - Best for code vulnerability analysis (7B params, ~4GB)"  
echo "  • llama3       - Most advanced analysis capabilities (8B params, ~4.7GB)"
echo ""

# Show available models
echo "📋 Available models:"
ollama list

echo ""
echo "✅ Ollama setup complete!"
echo ""
echo "🔧 To use in the framework:"
echo "   1. Set AI_PROVIDER=ollama in your .env file"
echo "   2. Set AI_MODEL to one of: mistral, codellama, llama3"
echo "   3. Run: npm test"
echo ""
echo "💡 Pro tips:"
echo "   • mistral is fastest and works great for most security analysis"
echo "   • codellama is best for code-related vulnerabilities"  
echo "   • llama3 provides the most detailed analysis but is slower"
echo ""
