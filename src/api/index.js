export default async function handler(req, res) {
// ===== CORS =====
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// preflight 対応
if (req.method === 'OPTIONS') {
return res.status(200).end();
}

// POST 以外は拒否
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

try {
const { title, date, description } = req.body;

const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.CLAUDE_API_KEY,
'anthropic-version': '2023-06-01',
},
body: JSON.stringify({
model: 'claude-3-haiku-20240307',
max_tokens: 100,
messages: [
{
role: 'user',
content: `予定「${title}」(${date}) ${
description ? `詳細: ${description}` : ''
} に対する応援メッセージを30文字以内で生成してください。`,
},
],
}),
});

if (!response.ok) {
throw new Error('Claude API error');
}

const data = await response.json();
const message = data.content[0].text;

return res.status(200).json({
success: true,
message,
});

} catch (error) {
console.error(error);
return res.status(500).json({
success: false,
message: 'がんばってください！応援しています！',
});
}
}
