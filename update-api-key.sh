#!/bin/bash

# 🔑 UPDATE GROQ API KEY ON RENDER.COM

echo "🔑 ===== UPDATING GROQ API KEY ====="
echo ""

NEW_API_KEY="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"

echo "📝 New API Key: ${NEW_API_KEY:0:20}..."
echo ""

echo "🚨 IMPORTANT: You need to update the GROQ_API_KEY environment variable on Render.com"
echo ""
echo "📋 STEPS TO UPDATE ON RENDER.COM:"
echo "1. Go to: https://dashboard.render.com/"
echo "2. Select your service: konkmeng"
echo "3. Go to: Environment tab"
echo "4. Find: GROQ_API_KEY"
echo "5. Update value to: $NEW_API_KEY"
echo "6. Click: Save Changes"
echo "7. Service will automatically redeploy"
echo ""

echo "⏰ ALTERNATIVE: Trigger redeploy with current .env"
echo "The .env file has been updated locally, so a git push will use the new key:"
echo ""

# Create a dummy file to trigger deployment
echo "# Updated API key $(date)" > API_KEY_UPDATE.txt

git add API_KEY_UPDATE.txt
git commit -m "🔑 URGENT: Update to new Groq API key

- New API key: ${NEW_API_KEY:0:20}...
- Previous key was rate limited
- This should resolve all API connection issues
- Service will use new key after deployment

Status: Ready for immediate deployment"

echo "✅ Commit created with new API key reference"
echo ""
echo "🚀 DEPLOY NOW:"
echo "git push origin main"
echo ""
echo "⏰ ETA: 3-5 minutes for Render.com to rebuild and deploy"
echo ""
echo "🧪 TEST AFTER DEPLOYMENT:"
echo "curl -X POST https://konkmeng.onrender.com/api/analyze-code \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"code\":\"function test(){return 42;}\",\"language\":\"JavaScript\",\"responseLang\":\"en\"}'"