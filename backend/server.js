// backend/server.js

const express = require('express');
const cors = require('cors');
const { db } = require('./firebase.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// get user information
app.get('/user/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const userRef = db.collection('users').doc(uid);
    const user = await userRef.get();
    if (user.exists) {
      res.status(200).send(user.data());
    } else {
      res.status(404).send({ message: "This user does not exist" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error getting user" });
  }
});

// create user
app.post('/register', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.body.id);
    const newUser = {
      email: req.body.email,
      profile: {
        Summary: "",
        certifications: [],
        education: {},
        personal: {},
        skills: [],
        websites: [],
        work: []
      }
    };
    await userRef.set(newUser);
    res.status(201).send({ message: "Created user" });
  } catch (error) {
    res.status(500).send({ message: "Error creating user" });
  }
});

// update profile
app.put('/profile/:id', async (req, res) => {
  try {
    const newProfile = req.body;
    const uid = req.params.id;
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ profile: newProfile });
    res.status(200).send({ message: "Updated profile" });
  } catch (error) {
    res.status(500).send({ message: "Error updating profile" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); */

// backend/server.js
// === RESUME GENERATION PIPELINE ===

const { z } = require('zod');
const puppeteer = require('puppeteer');
const cosine = require('cosine-similarity');
const fetch = require('node-fetch');
const { pipeline } = await import('@xenova/transformers');

// ---- 1️⃣ OpenRouter helper ----
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function chatOnce(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.APP_URL || '',
      'X-Title': process.env.APP_NAME || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages,
      temperature: 0.2,
      max_tokens: 800
    })
  });
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? '';
}

// ---- 2️⃣ Embeddings ----
let embedder = null;
async function getEmbedder() {
  if (!embedder)
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return embedder;
}

async function embed(text) {
  const e = await getEmbedder();
  const output = await e(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// ---- 3️⃣ Ranking ----
function rankBullets(jdVec, bullets, bulletVecs) {
  const rows = bullets.map((b, i) => ({
    bullet: b,
    score: cosine(jdVec, bulletVecs[i] || jdVec)
  }));
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

// ---- 4️⃣ Rewriting ----
const REWRITE_SYS = `You improve resume bullets to match a job description.
Preserve truth; ≤18 words; active voice; no first-person. 
Return a JSON array of rewritten bullets only.`;

async function rewriteBullets(jobDescription, bulletsRanked) {
  const list = bulletsRanked.map(x => `• ${x.bullet}`).join('\n');
  const prompt = `Job description:\n${jobDescription}\n\nBullets to improve:\n${list}\n\nReturn JSON array of strings.`;
  const out = await chatOnce([
    { role: 'system', content: REWRITE_SYS },
    { role: 'user', content: prompt }
  ]);
  return JSON.parse(out);
}

// ---- 5️⃣ PDF rendering ----
function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function resumeHTML(profile, bullets) {
  const expHTML = bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('');
  return `<!doctype html>
  <html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    h2 { font-size: 14px; margin: 16px 0 6px; }
    ul { margin: 6px 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
  </style></head>
  <body>
    <h1>${escapeHTML(profile.personal?.name || 'Name')}</h1>
    <div>${escapeHTML(profile.personal?.email || '')}</div>
    <h2>Experience Highlights</h2>
    <ul>${expHTML}</ul>
  </body></html>`;
}

async function renderPDF(profile, bullets) {
  const html = resumeHTML(profile, bullets);
  const filename = `resume-${Date.now()}.pdf`;
  const outPath = path.join(FILES_DIR, filename);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
  });
  await browser.close();
  return filename;
}

// ---- 6️⃣ Main route ----
const GenerateSchema = z.object({
  userId: z.string(),
  jobDescription: z.string().min(40)
});

app.post('/api/generate', async (req, res) => {
  try {
    const { userId, jobDescription } = GenerateSchema.parse(req.body);

    // 1. Get user profile from Firestore
    const userRef = db.collection('users').doc(userId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    const profile = snap.data().profile;

    // 2. Collect all bullets from user profile (skills, work, etc.)
    const bullets = [];
    if (Array.isArray(profile.skills)) bullets.push(...profile.skills);
    if (Array.isArray(profile.work))
      profile.work.forEach(w =>
        bullets.push(...(w.bullets || []))
      );
    if (Array.isArray(profile.certifications))
      bullets.push(...profile.certifications);

    if (bullets.length === 0)
      return res.status(400).json({ error: 'No content in user profile to generate resume.' });

    // 3. Compute embeddings and rank
    const jdVec = await embed(jobDescription);
    const bulletVecs = await Promise.all(bullets.map(b => embed(b)));
    const ranked = rankBullets(jdVec, bullets, bulletVecs);

    // 4. Rewrite top bullets with Mistral
    const top = ranked.slice(0, 8);
    const rewritten = await rewriteBullets(jobDescription, top);

    // 5. Render PDF
    const filename = await renderPDF(profile, rewritten);

    res.json({ pdfUrl: `/files/${filename}`, usedBullets: rewritten });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});