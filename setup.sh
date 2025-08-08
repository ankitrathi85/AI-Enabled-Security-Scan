#!/bin/bash

echo "🛡️  Setting up AI-Enhanced Security Test Framework..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Install Playwright browsers
echo -e "${BLUE}🎭 Installing Playwright browsers...${NC}"
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Playwright browsers${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Playwright browsers installed successfully${NC}"

# Create reports directory
echo -e "${BLUE}📁 Creating reports directory...${NC}"
mkdir -p ./reports

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file and add your OpenAI API key${NC}"
fi

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if ZAP is running
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OWASP ZAP is running on localhost:8080${NC}"
else
    echo -e "${YELLOW}⚠️  OWASP ZAP is not running on localhost:8080${NC}"
    echo -e "${YELLOW}   Please start ZAP with API enabled before running tests${NC}"
fi

# Check if Juice Shop is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OWASP Juice Shop is running on localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  OWASP Juice Shop is not running on localhost:3000${NC}"
    echo -e "${YELLOW}   Please start Juice Shop before running tests${NC}"
fi

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Edit .env file and add your OpenAI API key"
echo -e "   2. Start OWASP ZAP on localhost:8080 (with API enabled)"
echo -e "   3. Start OWASP Juice Shop on localhost:3000"
echo -e "   4. Run: ${GREEN}npm test${NC} for full security assessment"
echo -e "   5. Run: ${GREEN}npm test -- --quick${NC} for quick test mode"
echo ""
echo -e "${BLUE}📚 For more information, see README.md${NC}"
