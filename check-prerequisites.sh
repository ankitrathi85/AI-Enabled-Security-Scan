#!/bin/bash

echo "🔍 Checking Prerequisites..."

# Check Juice Shop
echo -n "🧃 Juice Shop (localhost:3000): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING"
    echo "   Start with: docker run --rm -p 3000:3000 bkimminich/juice-shop"
fi

# Check ZAP
echo -n "🛡️  ZAP (localhost:8080): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q -E "(200|404)"; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING" 
    echo "   Start ZAP GUI or use Docker: docker run -p 8080:8080 zaproxy/zap-stable:latest"
fi

echo ""
echo "Once both are running, execute: npm test"
