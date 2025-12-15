import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// Firebase 初期化
if (!admin.apps.length) {
admin.initializeApp({
credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
});
}

const db = admin.firestore();

// AIメッセージ生成API
app.post("/api/generate", async (req, res) => {
try {
const { eventId } = req.body;

const doc = await db.collection("events").doc(eventId).get();
if (!doc.exists) {
return res.status(404).json({ error: "event not found" });
}

const event = doc.data();

const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": process.env.CLAUDE_API_KEY,
"anthropic-version": "2023-06-01"
},
body: JSON.stringify({
model: "claude-3-haiku-20240307",
max_tokens: 100,
messages: [{
role: "user",
content: `「${event.title}」を頑張る人への応援メッセージを1文で作って`
}]
})
});

const aiData = await aiRes.json();
const message = aiData.content[0].text;

res.json({ message });

} catch (e) {
res.status(500).json({ error: e.message });
}
});

export default app;
