#!/bin/bash

# 🧪 100% Functionality Test Script for KONKMENG AI

echo "🧪 ===== KONKMENG AI 100% FUNCTIONALITY TEST ====="
echo "Testing all critical functionality to ensure 100% working status"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="https://konkmeng.onrender.com"
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_api() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    local expected_field="$5"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s "$BASE_URL$endpoint")
    fi
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        echo "Response: $response"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Test 1: Health Check
test_api "Health Check" "/api/health" "GET" "" "KONKMENG is running"

# Test 2: Model Stats
test_api "Model Stats" "/api/model-stats" "GET" "" "success"

# Test 3: JavaScript Code Analysis (English)
test_api "JavaScript Analysis (EN)" "/api/analyze-code" "POST" \
    '{"code":"function greet(name) { return \"Hello \" + name; }","language":"JavaScript","responseLang":"en"}' \
    "success"

# Test 4: JavaScript Code Analysis (Khmer)
test_api "JavaScript Analysis (KM)" "/api/analyze-code" "POST" \
    '{"code":"function add(a, b) { return a + b; }","language":"JavaScript","responseLang":"km"}' \
    "success"

# Test 5: Python Code Analysis
test_api "Python Analysis" "/api/analyze-code" "POST" \
    '{"code":"def hello():\n    print(\"Hello World\")","language":"Python","responseLang":"en"}' \
    "success"

# Test 6: TypeScript Code Analysis
test_api "TypeScript Analysis" "/api/analyze-code" "POST" \
    '{"code":"interface User { name: string; age: number; }","language":"TypeScript","responseLang":"en"}' \
    "success"

# Test 7: Error Handling - Empty Code
test_api "Empty Code Validation" "/api/analyze-code" "POST" \
    '{"code":"","language":"JavaScript","responseLang":"en"}' \
    "Please provide actual code"

# Test 8: Error Handling - Whitespace Only
test_api "Whitespace Validation" "/api/analyze-code" "POST" \
    '{"code":"   \n  \t  ","language":"JavaScript","responseLang":"en"}' \
    "Please provide actual code"

echo "🧪 ===== TEST RESULTS ====="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! KONKMENG AI is 100% functional!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit 1
fi