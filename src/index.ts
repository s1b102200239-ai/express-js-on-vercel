import express from 'express';
import cors from 'cors';

const app = express();

// ★ 強化されたCORS設定
app.use(cors({
origin: '*', // すべてのオリジンを許可
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
credentials: true
}));

// ★ 追加のCORSヘッダー設定
app.use((req, res, next) => {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
res.header('Access-Control-Max-Age', '3600');

if (req.method === 'OPTIONS') {
res.sendStatus(200);
} else {
next();
}
});

app.use(express.json());

// 基本ルート
app.get('/', (req, res) => {
res.json({
message: 'Claude API Server is running!',
status: 'healthy',
timestamp: new Date().toISOString()
});
});

// Claude API呼び出し
app.post('/api/generate-ai-message', async (req, res) => {
try {
console.log('🤖 Claude API request received:', req.body);

const { title, date, description } = req.body;

if (!title) {
return res.status(400).json({
error: 'Title is required',
message: 'タイトルが必要です'
});
}

const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.CLAUDE_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-3-haiku-20240307',
max_tokens: 1024,
messages: [{
role: 'user',
content: `予定: ${title}\n時間: ${date}\n場所: ${description || ''}\n\nこの予定に向けて、心に寄り添う温かく自然な日本語で、やる気と活力が湧いてくるような応援メッセージを50文字以内で生成してください。親しみやすい口調でお願いします。`
}]
})
});

if (!response.ok) {
throw new Error(`Claude API Error: ${response.status}`);
}

const data = await response.json();
const aiMessage = data.content[0].text;

console.log('✅ Claude API response:', aiMessage);

res.json({
message: aiMessage,
status: 'success',
timestamp: new Date().toISOString()
});

} catch (error) {
console.error('❌ Claude API Error:', error);
res.status(500).json({
error: error.message,
message: 'AIメッセージの生成に失敗しました',
status: 'error',
timestamp: new Date().toISOString()
});
}
});

export default app;
