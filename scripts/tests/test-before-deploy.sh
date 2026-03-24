#!/bin/bash

# 🧪 Pre-Deployment Test Script
# Run this BEFORE deploying to production

echo "🧪 ===== PRE-DEPLOYMENT TESTS ====="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Test 1: Check environment variables
echo "📋 Test 1: Environment Variables"
if [ -f .env ]; then
    if grep -q "JWT_SECRET=" .env && grep -q "GROQ_API_KEY=" .env && grep -q "MONGODB_URI=" .env; then
        echo -e "${GREEN}✅ Required env vars found in .env${NC}"
    else
        echo -e "${RED}❌ Missing required env vars in .env${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found (OK if using system env vars)${NC}"
fi
echo ""

# Test 2: Check if server.js has the fixes
echo "📋 Test 2: Code Fixes Applied"
if grep -q "let lockKey = null" server.js; then
    echo -e "${GREEN}✅ Redis lock fix applied${NC}"
else
    echo -e "${RED}❌ Redis lock fix NOT found${NC}"
    FAILED=$((FAILED + 1))
fi

if grep -q "!code.trim()" server.js; then
    echo -e "${GREEN}✅ Whitespace validation applied${NC}"
else
    echo -e "${RED}❌ Whitespace validation NOT found${NC}"
    FAILED=$((FAILED + 1))
fi

if grep -q "gracefulShutdown" server.js; then
    echo -e "${GREEN}✅ Graceful shutdown handler applied${NC}"
else
    echo -e "${RED}❌ Graceful shutdown handler NOT found${NC}"
    FAILED=$((FAILED + 1))
fi

if grep -q "let statsResetInterval" server.js; then
    echo -e "${GREEN}✅ Stats interval management applied${NC}"
else
    echo -e "${RED}❌ Stats interval management NOT found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Check for sensitive data
echo "📋 Test 3: Security Check"
if grep -q "your-secret-key" server.js; then
    echo -e "${RED}❌ Found hardcoded secret in server.js${NC}"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi

if grep -q "error.message" server.js | grep -q "res.json"; then
    echo -e "${YELLOW}⚠️  Warning: error.message might be exposed to client${NC}"
fi
echo ""

# Test 4: Check Node modules
echo "📋 Test 4: Dependencies"
if [ -d node_modules ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found - run: npm install${NC}"
fi
echo ""

# Test 5: Try to start server (quick test)
echo "📋 Test 5: Server Startup Test"
echo "Starting server for 5 seconds..."
timeout 5s node server.js > /tmp/server-test.log 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Server started successfully${NC}"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Check logs:"
    cat /tmp/server-test.log
    FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo ""
    echo "🚀 Ready to deploy!"
    echo "Run: ./deploy.sh"
    exit 0
else
    echo -e "${RED}❌ $FAILED TEST(S) FAILED${NC}"
    echo ""
    echo "⚠️  Fix the issues above before deploying"
    exit 1
fi
