# 🔧 APPLY THESE FIXES TO server.js

## STEP 1: Add Global Variables (Top of File, after line 15)

```javascript
let statsResetInterval = null;  // ADD THIS
let redisClient = null;
let isRedisConnected = false;
let transporter = null;
```

## STEP 2: Fix JWT_SECRET (around line 120)

**FIND:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

**REPLACE WITH:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ FATAL ERROR: JWT_SECRET is not set in .env file');
    process.exit(1);
}
```

## STEP 3: Fix /api/analyze-code Input Validation (around line 1400)

**FIND:**
```javascript
if (!code) {
    return res.status(400).json({ 
        error: responseLang === 'km' ? `អត់ឃើញកូដផង ${masterName}!` : `No code found`
    });
}
```

**REPLACE WITH:**
```javascript
if (!code || !code.trim()) {
    return res.status(400).json({
        success: false,
        error: responseLang === 'km' 
            ? `សូមបញ្ជូនកូដដែលមានខ្លឹមសារ មិនមែនតែ whitespace`
            : 'Please provide actual code, not just whitespace'
    });
}

const trimmedCode = code.trim();
```

## STEP 4: Fix Redis Lock with Finally Block (in /api/analyze-code)

**FIND the entire try-catch block around line 1450-1600**

**REPLACE WITH:**
```javascript
let lockKey = null;

try {
    // Check Redis cache first
    if (isRedisConnected && redisClient) {
        try {
            const cachedResult = await redisClient.get(cacheKey);
            if (cachedResult) {
                console.log('✅ Cache HIT');
                return res.json({
                    success: true,
                    analysis: cachedResult,
                    cached: true
                });
            }
            
            // Acquire lock
            lockKey = `lock:${cacheKey}`;
            const lockAcquired = await redisClient.set(lockKey, '1', {
                NX: true,
                EX: CACHE_LOCK_TTL
            });
            
            if (!lockAcquired) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const retryResult = await redisClient.get(cacheKey);
                if (retryResult) {
                    return res.json({
                        success: true,
                        analysis: retryResult,
                        cached: true
                    });
                }
            }
        } catch (cacheError) {
            console.log('⚠️ Redis error:', cacheError.message);
        }
    }

    // Call Groq API
    let analysis = null;
    
    try {
        const prompt = responseLang === 'km' 
            ? `វិភាគកូដ ${language}:\n\`\`\`\n${trimmedCode}\n\`\`\``
            : `Analyze ${language} code:\n\`\`\`\n${trimmedCode}\n\`\`\``;

        const completion = await Promise.race([
            groq.chat.completions.create({
                messages: [
                    { role: 'system', content: getSystemPrompt(responseLang) },
                    { role: 'user', content: prompt }
                ],
                model: GROQ_MODEL,
                temperature: 0.0,
                max_tokens: 4096
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Groq API timeout')), 30000)
            )
        ]);

        analysis = completion.choices[0]?.message?.content;
        
        if (!analysis) {
            throw new Error('Empty response from Groq API');
        }
        
        groqUsageStats.success++;
        groqUsageStats.totalTokens += (completion.usage?.total_tokens || 0);
        groqUsageStats.lastUsed = new Date().toISOString();
        
    } catch (groqError) {
        groqUsageStats.failed++;
        console.error('❌ Groq API error:', groqError.message);
        throw new Error('Groq API failed');
    }

    // Save to Redis cache
    if (isRedisConnected && redisClient) {
        try {
            await redisClient.setEx(cacheKey, 86400, analysis);
            console.log('✅ Cached for 24 hours');
        } catch (cacheError) {
            console.log('⚠️ Redis write error:', cacheError.message);
        }
    }

    // Save to user history (with timeout)
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                if (err) return;
                
                try {
                    await User.findByIdAndUpdate(
                        decoded.id,
                        {
                            $push: {
                                analysisHistory: {
                                    $each: [{
                                        code: trimmedCode.substring(0, 1000),
                                        language,
                                        analysis: analysis.substring(0, 5000),
                                        createdAt: new Date()
                                    }],
                                    $slice: -50
                                }
                            }
                        },
                        { timeout: 5000 }  // ✅ ADD TIMEOUT
                    );
                } catch (historyError) {
                    console.error('❌ History save failed:', historyError.message);
                }
            });
        }
    }

    res.json({
        success: true,
        analysis,
        cached: false,
        model: GROQ_MODEL
    });

} catch (error) {
    console.error('❌ Analysis error:', error.message);
    
    // ✅ GENERIC ERROR MESSAGE (no sensitive info)
    res.status(500).json({
        success: false,
        error: responseLang === 'km'
            ? 'មានបញ្ហាក្នុងប្រព័ន្ធ សូមព្យាយាមម្តងទៀត'
            : 'Internal server error. Please try again.'
    });
    
} finally {
    // ✅ ALWAYS RELEASE LOCK
    if (lockKey && isRedisConnected && redisClient) {
        try {
            await redisClient.del(lockKey);
            console.log('✅ Lock released');
        } catch (e) {
            console.log('⚠️ Lock cleanup failed:', e.message);
        }
    }
}
```

## STEP 5: Fix Stats Reset Interval (around line 1350)

**FIND:**
```javascript
setInterval(() => {
    groqUsageStats = { success: 0, failed: 0, totalTokens: 0, lastUsed: null };
}, STATS_RESET_INTERVAL);
```

**REPLACE WITH:**
```javascript
statsResetInterval = setInterval(() => {
    groqUsageStats = { success: 0, failed: 0, totalTokens: 0, lastUsed: null };
    console.log('📊 Stats reset');
}, STATS_RESET_INTERVAL);
```

## STEP 6: Add Graceful Shutdown (at END of file, before app.listen)

**ADD THIS CODE:**
```javascript
// ===== GRACEFUL SHUTDOWN =====
async function gracefulShutdown(signal) {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    
    // Clear stats interval
    if (statsResetInterval) {
        clearInterval(statsResetInterval);
        console.log('✅ Stats interval cleared');
    }
    
    // Close Redis connection
    if (redisClient && isRedisConnected) {
        try {
            await redisClient.quit();
            console.log('✅ Redis connection closed');
        } catch (error) {
            console.log('⚠️ Redis close error:', error.message);
        }
    }
    
    // Close MongoDB connection
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    } catch (error) {
        console.log('⚠️ MongoDB close error:', error.message);
    }
    
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
```

## STEP 7: Fix All Error Messages (in ALL catch blocks)

**FIND patterns like:**
```javascript
catch (error) {
    res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message  // ❌ REMOVE THIS
    });
}
```

**REPLACE WITH:**
```javascript
catch (error) {
    console.error('❌ Error:', error.message);  // Log internally only
    
    const lang = req.body.responseLang || 'en';
    res.status(500).json({
        success: false,
        error: lang === 'km' 
            ? 'មានបញ្ហាក្នុងប្រព័ន្ធ'
            : 'Internal server error'
        // ✅ No error.message, no error.stack
    });
}
```

## STEP 8: Add responseLang to ALL Endpoints

Make sure EVERY endpoint that returns user-facing messages uses:
```javascript
const lang = req.body.responseLang || 'en';
```

And uses it in error messages:
```javascript
error: lang === 'km' ? 'ខ្មែរ message' : 'English message'
```

