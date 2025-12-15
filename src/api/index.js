const express = require('express');
const cors = require('cors');
const app = express();

// 超強力CORS設定
app.use(cors({
origin: '*', // すべてのオリジンを許可
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
allowedHeaders: ['*']
}));

// 追加のCORSヘッダー
app.use((req, res, next) => {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', '*');
res.header('Access-Control-Allow-Headers', '*');
res.header('Access-Control-Allow-Credentials', 'true');

if (req.method === 'OPTIONS') {
res.sendStatus(200);
return;
}
next();
});

app.use(express.json({ limit: '10mb' }));

// テスト用エンドポイント
app.get('/api/test', (req, res) => {
res.json({ message: 'CORS Test Success!', timestamp: new Date().toISOString() });
});

// Claude API経由でAIメッセージ生成
app.post('/api/generate-ai-message', async (req, res) => {
try {
const { title, date, description } = req.body;

// Claude API呼び出し（実装済み）
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.CLAUDE_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-3-haiku-20240307',
max_tokens: 100,
messages: [{
role: 'user',
content: `予定「${title}」(${date})${description ? `詳細: ${description}` : ''}に対する応援メッセージを30文字以内で生成してください。`
}]
})
});

if (response.ok) {
const data = await response.json();
const message = data.content[0].text;
res.json({ success: true, message });
} else {
res.json({ success: false, message: 'きっと素晴らしい予定になりますね！' });
}
} catch (error) {
res.json({ success: false, message: 'がんばってください！応援しています！' });
}
});

module.exports = app;
