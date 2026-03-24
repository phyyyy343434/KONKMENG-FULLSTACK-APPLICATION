#!/bin/bash

# Test script to verify formatting improvements in KONKMENG AI v5.1

echo "🧪 Testing KONKMENG AI v5.1 Formatting Fix"
echo "=========================================="
echo ""

# Test with simple code
TEST_CODE='function hello() {
  console.log("Hello");
}'

echo "📝 Sending test code to API..."
echo ""

# Call the API
RESPONSE=$(curl -s -X POST https://konkmeng.onrender.com/api/analyze-code \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$TEST_CODE\",
    \"language\": \"javascript\",
    \"responseLang\": \"en\"
  }")

echo "📊 Response received:"
echo ""
echo "$RESPONSE" | jq -r '.analysis' | head -50

echo ""
echo "✅ Check if formatting has:"
echo "   - Double line breaks between sections"
echo "   - Each bullet point on separate line"
echo "   - Code blocks isolated on new lines"
echo "   - ASCII boxes with padding"
