// ===== CRITICAL FIXES FOR KONKMENG v5.0 =====
// Apply these fixes to server.js immediately

// ===== FIX 1: Redis Race Condition with Locking =====
const CACHE_LOCK_TTL = 30; // 30 seconds lock

const analyzeCodeWithRaceConditionFix = async (req, res) => {
    const { code, language, responseLang = 'en' } = req.body;
    const masterName = req.user?.name || "Master";
    
    // Input validation
    const MAX_CODE_LENGTH = 50000; // 50KB max
    
    if (!code) {
        return res.status(400).json({ 
            error: responseLang === 'km' ? `អត់ឃើញកូដផង ${masterName}!` : `No code found!`
        });
    }
    
    if (code.length > MAX_CODE_LENGTH) {
        return res.status(400).json({
            success: false,
            error: responseLang === 'km' 
                ? `កូដវែងពេក! កំណត់អតិបរមា ${MAX_CODE_LENGTH} តួអក្សរ`
                : `Code too long! Maximum ${MAX_CODE_LENGTH} characters`,
            currentLength: code.length,
            maxLength: MAX_CODE_LENGTH
        });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: responseLang === 'km' ? 'API Key មិនត្រឹមត្រូវ' : 'API Key not configured'
        });
    }

    // Generate cache key
    const cacheKey = crypto.createHash('sha256')
        .update(`${code}:${language}:${responseLang}`)
        .digest('hex');

    console.log('\n📥 ===== ANALYSIS REQUEST =====');
    console.log('Language:', language);
    console.log('Response Language:', responseLang);
    console.log('Code length:', code.length);
    console.log('Cache Key:', cacheKey.substring(0, 16) + '...');

    try {
        // Check Redis cache first
        if (isRedisConnected && redisClient) {
            try {
                const cachedResult = await redisClient.get(cacheKey);
                if (cachedResult) {
                    console.log('✅ Cache HIT - Returning cached result');
                    return res.json({
                        success: true,
                        analysis: cachedResult,
                        cached: true,
                        message: responseLang === 'km' ? 'លទ្ធផលពី Cache (សន្សំ API Credits)' : 'Result from cache'
                    });
                }
                
                // Try to acquire lock to prevent race condition
                const lockKey = `lock:${cacheKey}`;
                const lockAcquired = await redisClient.set(lockKey, '1', {
                    NX: true,  // Only set if not exists
                    EX: CACHE_LOCK_TTL
                });
                
                if (!lockAcquired) {
                    // Another request is processing, wait and retry
                    console.log('⏳ Another request is processing this code, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Check cache again after waiting
                    const retryResult = await redisClient.get(cacheKey);
                    if (retryResult) {
                        console.log('✅ Cache HIT after waiting - Returning cached result');
                        return res.json({
                            success: true,
                            analysis: retryResult,
                            cached: true,
                            message: responseLang === 'km' ? 'លទ្ធផលពី Cache (រង់ចាំបន្តិច)' : 'Result from cache (waited)'
                        });
                    }
                    // If still no cache, proceed with API call
                }
                
                console.log('⚠️  Cache MISS - Will call Gemini API');
            } catch (cacheError) {
                console.log('⚠️  Redis error:', cacheError.message);
            }
        } else {
            console.log('⚠️  Redis not connected - Skipping cache check');
        }

        // Server-side security scan
        const serverSideVulnerabilities = performSecurityScan(code);
        let securityContext = '';
        if (serverSideVulnerabilities.length > 0) {
            securityContext = responseLang === 'km' 
                ? `\n\n⚠️ ការស្កេនសុវត្ថិភាពរកឃើញបញ្ហា:\n${serverSideVulnerabilities.map(v => `- ${v.type}: ${v.message}`).join('\n')}`
                : `\n\nSecurity scan found issues:\n${serverSideVulnerabilities.map(v => `- ${v.type}: ${v.message}`).join('\n')}`;
        }

        // Call Gemini API with model fallback
        let analysis = null;
        let usedModel = null;
        let quotaExceeded = false;

        for (let i = 0; i < GEMINI_MODELS.length; i++) {
            const modelName = GEMINI_MODELS[i];
            
            try {
                console.log(`🤖 Trying Gemini model [${i + 1}/${GEMINI_MODELS.length}]: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = responseLang === 'km' 
                    ? `វិភាគកូដ ${language} នេះ:${securityContext}\n\n\`\`\`${language}\n${code}\n\`\`\``
                    : `Analyze this ${language} code:${securityContext}\n\n\`\`\`${language}\n${code}\n\`\`\``;

                // Call with timeout
                const result = await Promise.race([
                    model.generateContent([
                        { text: getSystemPrompt(responseLang) },
                        { text: prompt }
                    ]),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Gemini API timeout after 30s')), 30000)
                    )
                ]);

                const response = await result.response;
                analysis = response.text();
                usedModel = modelName;
                
                modelUsageStats[modelName].success++;
                
                console.log(`✅ Success with model: ${modelName}`);
                console.log(`📊 Model Stats: ${JSON.stringify(modelUsageStats[modelName])}`);
                break;
                
            } catch (modelError) {
                if (modelUsageStats[modelName]) {
                    modelUsageStats[modelName].failed++;
                }
                
                console.log(`❌ Model ${modelName} failed:`, modelError.message);
                
                if (modelError.message && modelError.message.includes('429')) {
                    quotaExceeded = true;
                    console.log('⚠️  QUOTA EXCEEDED for model:', modelName);
                }
                
                if (i === GEMINI_MODELS.length - 1) {
                    console.log('❌ All models exhausted');
                    throw new Error(quotaExceeded ? 'QUOTA_EXCEEDED' : 'ALL_MODELS_FAILED');
                }
                
                console.log('⏳ Waiting 1s before trying next model...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!analysis) {
            throw new Error('Failed to generate analysis');
        }

        // Save to Redis cache with lock cleanup
        if (isRedisConnected && redisClient) {
            try {
                await redisClient.setEx(cacheKey, 86400, analysis);
                console.log('✅ Cached result for 24 hours');
                
                // Release lock
                const lockKey = `lock:${cacheKey}`;
                await redisClient.del(lockKey);
                console.log('✅ Released cache lock');
            } catch (cacheError) {
                console.log('⚠️  Redis write error:', cacheError.message);
            }
        }

        // Save to user history (fire and forget with proper error handling)
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
                    if (err) {
                        console.log('⚠️  JWT verification failed:', err.message);
                        return;
                    }
                    
                    try {
                        await User.findByIdAndUpdate(decoded.id, {
                            $push: {
                                analysisHistory: {
                                    $each: [{
                                        code: code.substring(0, 1000), // Store only first 1KB
                                        language,
                                        analysis: analysis.substring(0, 5000), // Store only first 5KB
                                        createdAt: new Date()
                                    }],
                                    $slice: -50 // Keep only last 50 entries
                                }
                            }
                        }, { 
                            timeout: 5000 // 5 second timeout
                        });
                        console.log('✅ Saved to user history');
                    } catch (historyError) {
                        console.error('❌ History save failed:', historyError.message);
                    }
                });
            }
        }

        console.log('✅ Analysis completed successfully\n');

        res.json({
            success: true,
            analysis,
            cached: false,
            model: usedModel,
            securityScan: serverSideVulnerabilities.length > 0 ? {
                found: serverSideVulnerabilities.length,
                issues: serverSideVulnerabilities
            } : null,
            message: responseLang === 'km' ? 'វិភាគជោគជ័យ' : 'Analysis successful'
        });

    } catch (error) {
        console.error('❌ Analysis error:', error.message);
        console.log('📊 Current Model Usage Stats:', JSON.stringify(modelUsageStats, null, 2));
        
        // Release lock on error
        if (isRedisConnected && redisClient) {
            try {
                const lockKey = `lock:${cacheKey}`;
                await redisClient.del(lockKey);
            } catch (e) {
                // Ignore lock cleanup errors
            }
        }
        
        if (error.message === 'QUOTA_EXCEEDED') {
            const khmerError = `⚠️ ចំនួន API Credits ហួសកម្រិតហើយ!\n\n` +
                `សូមរង់ចាំ ៥-១០ នាទី ឬប្រើ API Key ថ្មី។\n` +
                `ប្រព័ន្ធនឹងព្យាយាមប្រើ Model ផ្សេងទៀតដោយស្វ័យប្រវត្តិ។\n\n` +
                `💡 ដំបូន្មាន: ប្រើ Redis Cache ដើម្បីសន្សំ API Credits។`;
            
            const englishError = `⚠️ API Quota Exceeded!\n\n` +
                `Please wait 5-10 minutes or use a new API key.\n` +
                `The system will automatically try different models.\n\n` +
                `💡 Tip: Use Redis Cache to save API credits.`;
            
            return res.status(429).json({
                success: false,
                error: responseLang === 'km' ? khmerError : englishError,
                errorCode: 'QUOTA_EXCEEDED',
                modelStats: modelUsageStats,
                suggestion: responseLang === 'km' 
                    ? 'សូមពិនិត្យ Google AI Studio: https://aistudio.google.com/apikey'
                    : 'Check your quota at: https://aistudio.google.com/apikey'
            });
        }
        
        const errorMsg = responseLang === 'km' 
            ? 'ការវិភាគបរាជ័យ សូមព្យាយាមម្តងទៀត' 
            : 'Analysis failed, please try again';
        
        res.status(500).json({
            success: false,
            error: errorMsg,
            details: error.message,
            modelStats: modelUsageStats
        });
    }
};

// ===== FIX 2: Server-Side Security Scanning =====
function performSecurityScan(code) {
    const vulnerabilities = [];
    
    // 1. SQL Injection patterns (including obfuscated)
    const sqlPatterns = [
        { pattern: /SELECT\s+.*\s+FROM/gi, name: 'SQL SELECT' },
        { pattern: /INSERT\s+INTO/gi, name: 'SQL INSERT' },
        { pattern: /UPDATE\s+.*\s+SET/gi, name: 'SQL UPDATE' },
        { pattern: /DELETE\s+FROM/gi, name: 'SQL DELETE' },
        { pattern: /DROP\s+TABLE/gi, name: 'SQL DROP' },
        { pattern: /UNION\s+SELECT/gi, name: 'SQL UNION' },
        { pattern: /exec\s*\(/gi, name: 'SQL EXEC' },
        { pattern: /execute\s*\(/gi, name: 'SQL EXECUTE' },
        { pattern: /eval\s*\(\s*atob/gi, name: 'Obfuscated eval(atob)' },
        { pattern: /String\.fromCharCode/gi, name: 'String.fromCharCode obfuscation' },
        { pattern: /Buffer\.from.*base64/gi, name: 'Base64 Buffer obfuscation' }
    ];
    
    sqlPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(code)) {
            vulnerabilities.push({
                type: 'SQL_INJECTION',
                severity: 'HIGH',
                pattern: name,
                message: `រកឃើញលំនាំ ${name} ដែលអាចបង្កគ្រោះថ្នាក់`
            });
        }
    });
    
    // 2. XSS patterns
    const xssPatterns = [
        { pattern: /<script[^>]*>.*<\/script>/gi, name: '<script> tag' },
        { pattern: /javascript:/gi, name: 'javascript: protocol' },
        { pattern: /on\w+\s*=/gi, name: 'Event handler (onclick, onerror, etc.)' },
        { pattern: /eval\s*\(/gi, name: 'eval() function' },
        { pattern: /innerHTML\s*=/gi, name: 'innerHTML assignment' },
        { pattern: /document\.write/gi, name: 'document.write()' }
    ];
    
    xssPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(code)) {
            vulnerabilities.push({
                type: 'XSS',
                severity: 'HIGH',
                pattern: name,
                message: `រកឃើញលំនាំ ${name} ដែលអាចបង្កគ្រោះថ្នាក់ XSS`
            });
        }
    });
    
    // 3. Hardcoded secrets (including encoded)
    const secretPatterns = [
        { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'API Key' },
        { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Password' },
        { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Secret' },
        { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Token' },
        { pattern: /AIza[0-9A-Za-z_-]{35}/g, name: 'Google API Key' },
        { pattern: /sk-[a-zA-Z0-9]{48}/g, name: 'OpenAI API Key' },
        { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub Token' },
        { pattern: /['"][A-Za-z0-9+/]{40,}={0,2}['"]/g, name: 'Base64 encoded secret' }
    ];
    
    secretPatterns.forEach(({ pattern, name }) => {
        const matches = code.match(pattern);
        if (matches) {
            vulnerabilities.push({
                type: 'HARDCODED_SECRET',
                severity: 'CRITICAL',
                pattern: name,
                count: matches.length,
                message: `រកឃើញ ${name} ដែលបានបង្កប់ក្នុងកូដ (${matches.length} កន្លែង)`
            });
        }
    });
    
    return vulnerabilities;
}

// ===== FIX 3: Model Stats with Auto-Reset =====
const STATS_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

let modelUsageStats = {
    'gemini-1.5-flash-latest': { success: 0, failed: 0, lastReset: Date.now() },
    'gemini-1.5-pro-latest': { success: 0, failed: 0, lastReset: Date.now() },
    'gemini-1.0-pro-latest': { success: 0, failed: 0, lastReset: Date.now() }
};

let statsHistory = []; // Keep last 7 days

// Reset stats every 24 hours
setInterval(() => {
    // Save current stats to history
    statsHistory.push({
        timestamp: new Date().toISOString(),
        stats: JSON.parse(JSON.stringify(modelUsageStats))
    });
    
    // Keep only last 7 days
    if (statsHistory.length > 7) {
        statsHistory.shift();
    }
    
    // Reset current stats
    Object.keys(modelUsageStats).forEach(model => {
        modelUsageStats[model] = { success: 0, failed: 0, lastReset: Date.now() };
    });
    
    console.log('📊 Model stats reset - saved to history');
}, STATS_RESET_INTERVAL);

// ===== FIX 4: Rate Limiting =====
const rateLimit = require('express-rate-limit');

const analyzeCodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes per IP
    message: {
        success: false,
        error: 'ចំនួនសំណើរហួសកម្រិត សូមរង់ចាំ ១៥ នាទី',
        errorEn: 'Too many requests, please wait 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limit for cached responses
    skip: async (req) => {
        if (!req.body.code) return false;
        
        const cacheKey = crypto.createHash('sha256')
            .update(`${req.body.code}:${req.body.language}:${req.body.responseLang || 'en'}`)
            .digest('hex');
        
        if (isRedisConnected && redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                return !!cached; // Skip rate limit if cached
            } catch (e) {
                return false;
            }
        }
        return false;
    }
});

// ===== FIX 5: Improved Catch-All Route =====
// Replace the regex catch-all with this:
app.use((req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    // Serve SPA for all other routes
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// 404 handler for API routes (must be AFTER all API routes)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path
    });
});

// ===== FIX 6: CORS Configuration =====
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://konkmeng.onrender.com', 'https://www.konkmeng.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Replace: app.use(cors());
// With: app.use(cors(corsOptions));

// ===== USAGE =====
// Apply rate limiter to analyze-code endpoint:
// app.post('/api/analyze-code', analyzeCodeLimiter, analyzeCodeWithRaceConditionFix);
