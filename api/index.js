import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Anthropic from '@anthropic-ai/sdk';

const app = express();

/* ===== CORS（最重要） ===== */
app.use(cors({
 origin: '*',
 methods: ['GET', 'POST', 'OPTIONS'],
 allowedHeaders: ['Content-Type'],
}));

app.options('*', cors());

/* ===== middleware ===== */
app.use(bodyParser.json());

/* ===== Claude ===== */
const anthropic = new Anthropic({
 apiKey: process.env.CLAUDE_API_KEY,
});

/* ===== API ===== */
app.post('/api/generate-ai-message', async (req, res) => {
 try {
 const { title, date, description } = req.body;

 const prompt = `
予定タイトル: ${title}
予定内容: ${description || 'なし'}
日時: ${date}

この予定を応援する、やさしく前向きな日本語メッセージを1つ生成してください。
`;

 const message = await anthropic.messages.create({
 model: 'claude-3-5-sonnet-20240620',
 max_tokens: 150,
 messages: [
 { role: 'user', content: prompt }
 ],
 });

 res.json({
 message: message.content[0].text
 });

 } catch (err) {
 console.error(err);
 res.status(500).json({
 message: 'AIメッセージの生成に失敗しました'
 });
 }
});

/* ===== export for Vercel ===== */
export default app;
