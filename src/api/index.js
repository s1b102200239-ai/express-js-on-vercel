export default function handler(req, res) {
// CORS設定
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

if (req.method === 'OPTIONS') {
res.status(200).end();
return;
}

if (req.method === 'GET') {
return res.json({
message: 'Claude API Server is running!',
status: 'healthy',
timestamp: new Date().toISOString()
});
}

if (req.method === 'POST') {
return generateAIMessage(req, res);
}

res.status(405).json({ error: 'Method not allowed' });
}

async function generateAIMessage(req, res) {
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
const errorData = await response.text();
throw new Error(`Claude API Error: ${response.status} - ${errorData}`);
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
error: error.message || 'Unknown error',
message: 'AIメッセージの生成に失敗しました',
status: 'error',
timestamp: new Date().toISOString()
});
}
}
