const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🔑 GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('🔑 PORT:', PORT);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODELS = {
    FASTEST: 'llama-3.3-70b-versatile',
    BALANCED: 'llama-3.1-8b-instant',
    POWERFUL: 'mixtral-8x7b-32768'
};

app.post('/api/analyze-code', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        // FIXED: កុំប្រើ backticks នៅខាងក្នុង backticks
        const prompt = 'ពន្យល់កូដ ' + language + ' នេះជាភាសាខ្មែរ។ ពន្យល់មួយបន្ទាត់ៗ ហើយដាក់កូដណាដែលត្រូវពន្យល់ក្នុង `backticks`៖\n\n' + code;

        console.log('🤖 Using model:', MODELS.BALANCED);

        const response = await axios.post(GROQ_API_URL, {
            model: MODELS.BALANCED,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert code teacher. Explain code in simple Khmer language. Always wrap code examples in backticks `like this`.'
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
            }
        });

        console.log('✅ Groq API successful');
        
        res.json({ 
            analysis: response.data.choices[0].message.content,
            model: response.data.model,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Running',
        apiKeyConfigured: !!GROQ_API_KEY,
        models: MODELS
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log('📋 Available models:', MODELS);
});