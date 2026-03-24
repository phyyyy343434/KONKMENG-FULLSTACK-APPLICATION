# 🚀 DEPLOY TO PRODUCTION - KONKMENG v5.1

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Code Quality Checks
- [x] ✅ Race condition fixes applied
- [x] ✅ Redis lock with finally block
- [x] ✅ Whitespace validation
- [x] ✅ Error obfuscation (no sensitive info)
- [x] ✅ Graceful shutdown handler
- [x] ✅ Stats interval management

### 2. Environment Variables Check
```bash
# Run this to verify all required env vars are set:
node -e "
const required = ['JWT_SECRET', 'GROQ_API_KEY', 'MONGODB_URI'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.log('❌ Missing:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required env vars are set');
}
"
```

**Required Environment Variables:**
- ✅ `NODE_ENV=production`
- ✅ `MONGODB_URI` (MongoDB connection string)
- ✅ `JWT_SECRET` (Strong secret key)
- ✅ `GROQ_API_KEY` (Groq API key)
- ⚠️  `REDIS_URL` (Optional - for caching)
- ⚠️  `GITHUB_CLIENT_SECRET` (Currently placeholder)

### 3. Local Testing
```bash
# Test locally first
npm install
npm start

# In another terminal, test endpoints:
curl http://localhost:3000/api/health

# Test whitespace validation:
curl -X POST http://localhost:3000/api/analyze-code \
  -H "Content-Type: application/json" \
  -d '{"code":"   ","language":"JavaScript"}'

# Expected: Error about whitespace

# Test graceful shutdown:
# Press Ctrl+C and verify cleanup messages
```

### 4. Security Audit
- [x] ✅ No hardcoded secrets in code
- [x] ✅ JWT_SECRET validation (exits if missing)
- [x] ✅ Error messages don't expose internal details
- [x] ✅ CORS configured for production domains
- [x] ✅ Rate limiting enabled
- [x] ✅ Input validation (whitespace, length)

### 5. Performance Checks
- [x] ✅ Redis caching enabled (24-hour TTL)
- [x] ✅ Lock mechanism to prevent race conditions
- [x] ✅ Graceful degradation if Redis fails
- [x] ✅ Database query timeouts (5 seconds)
- [x] ✅ Groq API timeout (30 seconds)

## 🚀 DEPLOYMENT STEPS

### Option 1: Quick Deploy (Recommended)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deploy

```bash
# 1. Check git status
git status

# 2. Add all changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: Deploy v5.1 - Production-ready with race condition fixes

Critical Fixes:
- Redis lock with try-catch-finally pattern
- Whitespace input validation
- Error obfuscation (no sensitive info leakage)
- Graceful shutdown handler (SIGTERM, SIGINT)
- Stats interval management

Security Improvements:
- JWT_SECRET validation (exits if missing)
- Generic error messages to clients
- Proper resource cleanup on shutdown

Performance:
- Redis caching with 24-hour TTL
- Lock mechanism prevents race conditions
- Database query timeouts
- Groq API timeout protection"

# 4. Push to production
git push origin main
# or
git push origin master
```

### Option 3: Deploy to Render (if using Render)

```bash
# Render will auto-deploy when you push to main/master
git push origin main

# Monitor deployment at:
# https://dashboard.render.com/
```

## 📊 POST-DEPLOYMENT VERIFICATION

### 1. Health Check
```bash
# Wait 3-5 minutes for deployment to complete, then:
curl https://konkmeng.onrender.com/api/health

# Expected response:
{
  "status": "✅ KONKMENG is running",
  "version": "5.1 | Groq Edition",
  "engine": "Groq Llama 3.3 70B Versatile",
  "apiKey": "✅ Configured",
  "mongodb": "✅ Connected",
  "redis": {
    "status": "✅ Connected" or "⚠️ Disconnected",
    "caching": "Active (24h TTL)" or "Disabled"
  },
  "features": {
    "authentication": "✅ Enabled",
    "caching": "✅ Active" or "⚠️ Disabled",
    "minimalistPrompt": "✅ Enabled"
  }
}
```

### 2. Test Whitespace Validation
```bash
curl -X POST https://konkmeng.onrender.com/api/analyze-code \
  -H "Content-Type: application/json" \
  -d '{"code":"   ","language":"JavaScript","responseLang":"km"}'

# Expected: Error message about whitespace
{
  "success": false,
  "error": "សូមបញ្ជូនកូដដែលមានខ្លឹមសារ មិនមែនតែ whitespace"
}
```

### 3. Test Code Analysis
```bash
curl -X POST https://konkmeng.onrender.com/api/analyze-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function hello() { console.log(\"Hello\"); }",
    "language": "JavaScript",
    "responseLang": "en"
  }'

# Expected: Analysis response with success: true
```

### 4. Test Error Obfuscation
```bash
# Trigger an error (e.g., send invalid data)
curl -X POST https://konkmeng.onrender.com/api/analyze-code \
  -H "Content-Type: application/json" \
  -d '{"code":"test","language":"JavaScript"}'

# Verify response does NOT contain:
# - error.message
# - error.stack
# - groqStats
# - Internal system details

# Should only show generic message:
{
  "success": false,
  "error": "Internal server error. Please try again later."
}
```

### 5. Monitor Logs
```bash
# If using Render, check logs at:
# https://dashboard.render.com/ > Your Service > Logs

# Look for:
# ✅ MongoDB connected successfully
# ✅ Redis connected successfully (or graceful degradation message)
# ✅ KONKMENG v5.1 | Groq Edition running
# ✅ No error messages about missing env vars
```

## 🔧 TROUBLESHOOTING

### Issue: "JWT_SECRET not set"
```bash
# Server exits immediately with error
# Solution: Add JWT_SECRET to Render environment variables
# Dashboard > Service > Environment > Add Variable
# Key: JWT_SECRET
# Value: your-strong-secret-key-here
```

### Issue: Redis connection failed
```bash
# Server shows: "⚠️ Redis connection failed"
# This is OK! Server continues with graceful degradation
# Caching will be disabled but everything else works

# To enable Redis:
# 1. Add Redis service on Render
# 2. Add REDIS_URL environment variable
```

### Issue: MongoDB connection error
```bash
# Check MONGODB_URI is correct
# Verify MongoDB Atlas allows connections from Render IPs
# MongoDB Atlas > Network Access > Add IP Address > Allow from Anywhere (0.0.0.0/0)
```

### Issue: Groq API errors
```bash
# Verify GROQ_API_KEY is valid
# Check Groq API quota at: https://console.groq.com/
# Monitor groqUsageStats via: /api/model-stats endpoint
```

## 📈 MONITORING

### Key Metrics to Monitor

1. **Response Times**
   - Cached requests: < 100ms
   - Uncached requests: 2-5 seconds (Groq API)

2. **Error Rates**
   - Should be < 1% under normal conditions
   - Check `/api/model-stats` for Groq success/failure ratio

3. **Cache Hit Rate**
   - Monitor Redis cache hits vs misses
   - Good: > 50% cache hit rate

4. **Memory Usage**
   - Should be stable (no memory leaks)
   - Graceful shutdown should cleanup properly

### Monitoring Commands

```bash
# Check server status
curl https://konkmeng.onrender.com/api/health

# Check Groq usage stats
curl https://konkmeng.onrender.com/api/model-stats

# Expected response:
{
  "success": true,
  "stats": {
    "success": 150,
    "failed": 2,
    "totalTokens": 45000,
    "lastUsed": "2026-03-21T10:30:00.000Z"
  },
  "model": "llama-3.3-70b-versatile"
}
```

## 🎯 ROLLBACK PLAN

If something goes wrong:

```bash
# 1. Revert to previous commit
git log --oneline  # Find previous commit hash
git revert <commit-hash>
git push origin main

# 2. Or rollback on Render
# Dashboard > Service > Manual Deploy > Select previous deployment

# 3. Check logs to identify issue
# Fix locally, test, then redeploy
```

## ✅ DEPLOYMENT CHECKLIST

Before deploying:
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] No sensitive data in code
- [ ] Git repository is clean
- [ ] Commit message is descriptive

After deploying:
- [ ] Health check passes
- [ ] Whitespace validation works
- [ ] Code analysis works
- [ ] Error messages are generic (no leaks)
- [ ] Logs show no errors
- [ ] Monitor for 10-15 minutes

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

✅ Health endpoint returns 200 OK
✅ MongoDB shows "Connected"
✅ Redis shows "Connected" or "Graceful Degradation"
✅ Groq API key is configured
✅ Code analysis works correctly
✅ Whitespace validation rejects empty input
✅ Error messages don't expose sensitive info
✅ No memory leaks (stable memory usage)
✅ Graceful shutdown works (cleanup messages in logs)

## 📞 SUPPORT

If you encounter issues:

1. Check Render logs first
2. Verify environment variables
3. Test locally to reproduce
4. Check MongoDB Atlas network access
5. Verify Groq API quota

## 🚀 READY TO DEPLOY?

Run this command:
```bash
./deploy.sh
```

Or follow the manual steps above.

**Estimated deployment time:** 3-5 minutes

**Good luck! 🎉**
