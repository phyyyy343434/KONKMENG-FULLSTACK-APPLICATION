#!/bin/bash

# 🧪 Production Verification Test Script
# Tests all critical features of KONKMENG v5.1

echo "🧪 ===== PRODUCTION VERIFICATION TESTS ====="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PRODUCTION_URL="https://konkmeng.onrender.com"
PASSED=0
FAILED=0

echo -e "${BLUE}Testing: $PRODUCTION_URL${NC}"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
RESPONSE=$(curl -s "$PRODUCTION_URL/api/health")
if echo "$RESPONSE" | grep -q "5.1"; then
    echo -e "${GREEN}✅ PASSED - Version 5.1 detected${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED - Version 5.1 not found${NC}"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Whitespace Validation
echo "📋 Test 2: Whitespace Validation"
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/analyze-code" \
  -H "Content-Type: application/json" \
  -d '{"code":"   ","language":"JavaScript","responseLang":"km"}')
if echo "$RESPONSE" | grep -q "whitespace"; then
    echo -e "${GREEN}✅ PASSED - Whitespace validation working${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED - Whitespace validation not working${NC}"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Code Analysis
echo "📋 Test 3: Code Analysis"
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/analyze-code" \
  -H "Content-Type: application/json" \
  -d '{"code":"function test() { console.log(\"Hello\"); }","language":"JavaScript","responseLang":"en"}')
if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ PASSED - Code analysis working${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED - Code analysis not working${NC}"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Error Obfuscation
echo "📋 Test 4: Error Obfuscation"
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/analyze-code" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}')
if echo "$RESPONSE" | grep -q "error.message\|error.stack\|groqStats"; then
    echo -e "${RED}❌ FAILED - Sensitive info exposed${NC}"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED - Error obfuscation working${NC}"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 5: Model Stats
echo "📋 Test 5: Model Stats"
RESPONSE=$(curl -s "$PRODUCTION_URL/api/model-stats")
if echo "$RESPONSE" | grep -q "llama-3.3-70b-versatile"; then
    echo -e "${GREEN}✅ PASSED - Model stats accessible${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED - Model stats not accessible${NC}"
    echo "Response: $RESPONSE"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: MongoDB Connection
echo "📋 Test 6: MongoDB Connection"
RESPONSE=$(curl -s "$PRODUCTION_URL/api/health")
if echo "$RESPONSE" | grep -q "Connected"; then
    echo -e "${GREEN}✅ PASSED - MongoDB connected${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING - MongoDB might not be connected${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Summary
echo "======================================"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ Your production deployment is working correctly!"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Monitor logs for 24 hours"
    echo "   2. Check performance metrics"
    echo "   3. Gather user feedback"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "⚠️  Please check the failed tests above"
    echo "📖 Review: 🎉_DEPLOYMENT_SUCCESS_v5.1.md"
    echo ""
    exit 1
fi
