import express from 'express';

const app = express();

// CORS設定
app.use((req, res, next) => {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') {
res.sendStatus(204);
} else {
next();
}
});

app.use(express.json());

// Claude API呼び出し
app.post('/api/generate-ai-message', async (req, res) => {
try {
const { title, date, description } = req.body;

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
content: `予定: ${title}\n時間: ${date}\n場所: ${description || ''}\n\nこの予定に向けて、心に寄り添う温かく自然な日本語で、やる気と活力が湧いてくるような応援メッセージを50文字以内で生成してください。`
}]
})
});

const data = await response.json();
res.json({ message: data.content[0].text });

} catch (error) {
console.error('Error:', error);
res.status(500).json({ message: 'エラーが発生しました' });
}
});

export default app;
