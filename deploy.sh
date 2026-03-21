#!/bin/bash

# 🚀 Quick Deploy Script for Version 5.1 - Production Ready

echo "🚀 ===== KONKMENG v5.1 Deployment ====="
echo "📦 Race Condition Fixes + Security Hardening"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Run: git init"
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status --short
echo ""

# Ask for confirmation
read -p "🤔 Deploy these changes to production? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Add all changes
echo "📦 Adding changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "feat: Deploy v5.1 - Production-ready with critical fixes

Critical Fixes:
- Redis lock with try-catch-finally pattern (race condition fix)
- Whitespace input validation (prevent API waste)
- Error obfuscation (no sensitive info leakage)
- Graceful shutdown handler (SIGTERM, SIGINT, SIGUSR2)
- Stats interval management (memory leak prevention)

Security Improvements:
- JWT_SECRET validation (server exits if missing)
- Generic error messages to clients
- Proper resource cleanup on shutdown
- No error.message or error.stack exposed

Performance:
- Redis caching with 24-hour TTL
- Lock mechanism prevents race conditions
- Database query timeouts (5 seconds)
- Groq API timeout protection (30 seconds)
- Graceful degradation if Redis fails

Version: 5.1 | Groq Edition
Engine: Llama 3.3 70B Versatile
Status: Production Ready ✅"

# Push to production
echo "🚀 Pushing to production..."
git push origin main || git push origin master

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "⏳ Waiting for deployment (this takes ~3-5 minutes)..."
echo ""
echo "📊 Monitor deployment:"
echo "   Dashboard: https://dashboard.render.com/"
echo "   Logs: Check your service logs"
echo ""
echo "🧪 Test after deployment:"
echo "   Health: curl https://konkmeng.onrender.com/api/health"
echo "   Stats:  curl https://konkmeng.onrender.com/api/model-stats"
echo ""
echo "Expected version: 5.1 (Production Ready)"
echo "Features: Race condition fixes + Security hardening"
echo ""
echo "🎉 Deployment complete! Wait 3-5 minutes then test."
echo ""
echo "📖 Full deployment guide: 🚀_DEPLOY_TO_PRODUCTION_v5.1.md"
