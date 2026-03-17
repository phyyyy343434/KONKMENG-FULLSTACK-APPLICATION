const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('\n🔍 ===== GROQ DIAGNOSTICS =====');
console.log('🔑 GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('🔑 GROQ_API_KEY length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
console.log('🔑 PORT:', PORT);
console.log('===============================\n');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// WORKING GROQ MODELS (as of March 2026)
const GROQ_MODELS = {
    // Fast models (recommended)
    FAST: 'llama-3.1-8b-instant',        // ✅ Fastest, works well
    BALANCED: 'llama-3.3-70b-versatile',  // ✅ Good balance
    POWERFUL: 'mixtral-8x7b-32768',       // ✅ Powerful
    
    // Alternative models if above don't work
    ALT1: 'gemma2-9b-it',                  // ✅ Google Gemma
    ALT2: 'llama3-8b-8192',                 // ✅ Older but stable
    ALT3: 'llama3-70b-8192'                  // ❌ May be deprecated, use as last resort
};

// Test endpoint to check which models work
app.get('/api/test-groq', async (req, res) => {
    console.log('\n🔄 Testing Groq models...');
    
    if (!GROQ_API_KEY) {
        return res.status(500).json({
            error: 'API Key missing',
            message: 'GROQ_API_KEY is not set in .env file'
        });
    }

    const results = [];

    for (const [key, model] of Object.entries(GROQ_MODELS)) {
        try {
            console.log(`Testing ${key}: ${model}...`);
            
            const response = await axios.post(GROQ_API_URL, {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: 'Say "test" in JSON format: { "status": "ok" }'
                    }
                ],
                temperature: 0.1,
                max_tokens: 50
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.data?.choices?.[0]) {
                console.log(`✅ ${model} is WORKING!`);
                results.push({
                    model: model,
                    status: 'working',
                    response: response.data.choices[0].message.content
                });
            }
        } catch (error) {
            console.log(`❌ ${model} failed:`);
            let errorDetails = '';
            if (error.response) {
                errorDetails = error.response.data?.error?.message || error.message;
                console.log('Status:', error.response.status);
                console.log('Error:', errorDetails);
            } else {
                errorDetails = error.message;
                console.log('Error:', errorDetails);
            }
            
            results.push({
                model: model,
                status: 'failed',
                error: errorDetails
            });
        }
    }

    res.json({
        apiKeyPresent: !!GROQ_API_KEY,
        apiKeyLength: GROQ_API_KEY ? GROQ_API_KEY.length : 0,
        testResults: results,
        recommendation: 'Use llama-3.1-8b-instant for best results'
    });
});

// Simplified Khmer prompt (to avoid complexity)
const getSimpleKhmerPrompt = (code, language) => {
    return `You are a Khmer teacher. Explain this ${language} code in simple Khmer.

RULES:
- Use easy Khmer words
- Explain line by line starting with *line X:
- Put code in \`backticks\`

Code:
\`\`\`${language}
${code}
\`\`\`

Explain in Khmer:`;
};

// ===== MAIN ANALYSIS ENDPOINT =====
app.post('/api/analyze-code', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        console.log('\n📥 Request received:');
        console.log('Language:', language);
        console.log('Code length:', code?.length || 0);

        // Validation
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ 
                error: 'GROQ API Key not configured',
                details: 'Please add GROQ_API_KEY to your .env file'
            });
        }

        // Try models in order (from most reliable to least)
        const modelsToTry = [
            { name: 'llama-3.1-8b-instant', type: 'FAST' },
            { name: 'llama-3.3-70b-versatile', type: 'BALANCED' },
            { name: 'mixtral-8x7b-32768', type: 'POWERFUL' },
            { name: 'gemma2-9b-it', type: 'ALT1' }
        ];

        let lastError = null;

        for (const modelInfo of modelsToTry) {
            try {
                console.log(`🤖 Trying ${modelInfo.name}...`);

                const prompt = getSimpleKhmerPrompt(code, language);

                const response = await axios.post(GROQ_API_URL, {
                    model: modelInfo.name,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a Khmer teacher. Explain code in simple Khmer.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 2048
                }, {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                if (response.data?.choices?.[0]) {
                    console.log(`✅ Success with ${modelInfo.name}`);
                    
                    return res.json({
                        success: true,
                        analysis: response.data.choices[0].message.content,
                        model: `${modelInfo.name} (${modelInfo.type})`,
                        usage: response.data.usage
                    });
                }

            } catch (error) {
                console.log(`❌ ${modelInfo.name} failed:`, error.message);
                lastError = error;
                
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Error details:', error.response.data?.error?.message);
                }
                // Continue to next model
            }
        }

        // If all models failed
        console.error('\n❌ All models failed');
        
        // Provide helpful error message
        let errorMessage = 'All Groq models failed';
        let errorDetails = lastError?.message || 'Unknown error';
        let suggestion = '';

        if (lastError?.response?.status === 401) {
            errorDetails = 'Invalid API key';
            suggestion = 'Please check your GROQ_API_KEY in .env file';
        } else if (lastError?.response?.status === 429) {
            errorDetails = 'Rate limit exceeded';
            suggestion = 'You have exceeded Groq free tier limits. Try again later.';
        } else if (lastError?.response?.status === 400) {
            errorDetails = 'Bad request - model may be deprecated';
            suggestion = 'Run /api/test-groq to see working models';
        }

        res.status(500).json({
            error: errorMessage,
            details: errorDetails,
            suggestion: suggestion || 'Run /api/test-groq for diagnostics'
        });

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            details: error.message,
            suggestion: 'Check server logs'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'KONKMENG API is running',
        apiKeyConfigured: !!GROQ_API_KEY,
        endpoints: {
            test: '/api/test-groq',
            analyze: '/api/analyze-code',
            health: '/api/health'
        },
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log('\n🚀 ==================================');
    console.log(`🚀 KONKMENG Server running on http://localhost:${PORT}`);
    console.log('🚀 ==================================\n');
    console.log('📋 AVAILABLE ENDPOINTS:');
    console.log(`   1. Test API: http://localhost:${PORT}/api/test-groq`);
    console.log(`   2. Analyze: POST http://localhost:${PORT}/api/analyze-code`);
    console.log(`   3. Health: http://localhost:${PORT}/api/health\n`);
    console.log('📋 RECOMMENDED MODELS:');
    console.log('   - ✅ llama-3.1-8b-instant (Fastest, most reliable)');
    console.log('   - ✅ llama-3.3-70b-versatile (Best quality)');
    console.log('   - ✅ mixtral-8x7b-32768 (Alternative)\n');
    console.log('⚠️  If you see errors, run /api/test-groq first\n');
});