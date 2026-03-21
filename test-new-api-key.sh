#!/bin/bash

# 🧪 TEST NEW API KEY DEPLOYMENT

echo "🧪 ===== TESTING NEW GROQ API KEY DEPLOYMENT ====="
echo ""

BASE_URL="https://konkmeng.onrender.com"
NEW_KEY="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"

echo "🔍 Testing deployment status..."
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check:"
curl -s "$BASE_URL/api/health" | head -1
echo ""

# Test 2: Model Stats (shows if new API key is working)
echo "2️⃣ Model Stats:"
curl -s "$BASE_URL/api/model-stats" | head -1
echo ""

# Test 3: Simple Code Analysis
echo "3️⃣ Code Analysis Test:"
response=$(curl -s -X POST "$BASE_URL/api/analyze-code" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function hello() { return \"Hello World\"; }",
    "language": "JavaScript",
    "responseLang": "en"
  }')

if echo "$response" | grep -q '"success":true'; then
    echo "✅ SUCCESS: API is working with new key!"
    echo "Response preview:"
    echo "$response" | head -3
else
    echo "❌ FAILED: API still not working"
    echo "Error response:"
    echo "$response" | head -5
fi

echo ""
echo "🎯 SUMMARY:"
if echo "$response" | grep -q '"success":true'; then
    echo "✅ NEW API KEY IS WORKING!"
    echo "✅ Users can now analyze code successfully"
    echo "✅ All features should be functional"
else
    echo "❌ Still having issues - may need manual env update on Render.com"
    echo "🔧 Next step: Update GROQ_API_KEY manually in Render dashboard"
fi

echo ""
echo "🌐 Test the website: https://www.konkmeng-ai.fun/"