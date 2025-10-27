// backend/server.js

// === IMPORTS ===
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebase.js');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const { z } = require('zod');

// === CONFIG ===
const app = express();
const PORT = 5005;
const FILES_DIR = path.join(__dirname, 'files');
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

app.use(cors());
app.use(express.json());
app.use('/files', express.static(FILES_DIR)); // serve generated PDFs

// === BASIC ROUTES ===
app.get('/', (req, res) => res.send('Backend is running!'));

// get user info
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
    console.error(error);
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
    console.error(error);
    res.status(500).send({ message: "Error creating user" });
  }
});

// update profile
app.put('/profile/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const newProfile = req.body;
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ profile: newProfile });
    res.status(200).send({ message: "Updated profile" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating profile" });
  }
});

// === OPENROUTER + MISTRAL ===
// const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// async function chatOnce(messages) {
//  const res = await fetch(OPENROUTER_URL, {
//    method: 'POST',
//    headers: {
//      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//      'HTTP-Referer': process.env.APP_URL || '',
//      'X-Title': process.env.APP_NAME || '',
//      'Content-Type': 'application/json'
//    },
//    body: JSON.stringify({
//      model: 'mistralai/mistral-7b-instruct:free',
//      messages,
//      temperature: 0.2,
//      max_tokens: 16000
//    })
//  });
//  const json = await res.json();
//  return json?.choices?.[0]?.message?.content ?? '';
//}

//const GENERATE_SYS = `You generate a resume using the entries from a user profile most relevant to the job description and responsibilities.
//Preserve truth; active voice; no first-person. Return a JSON object containing keys like:
//{
//  "summary": string,
//  "skills": [string],
//  "experience_bullets": [string],
//  "education": [ { "degree": string, "institution": string, "year": string } ]
//}
//Do NOT include markdown or extra text.`;

//async function resumeGeneration(jobDescription, jobResponsibilities, userId) {

  // Get user profile
//  const userRef = db.collection('users').doc(userId);
//  const snap = await userRef.get();
//  if (!snap.exists) return res.status(404).json({ error: 'User not found' });
//  const profile = snap.data().profile;

//  const prompt = `You are creating a tailored resume.
//  Job Description: ${jobDescription}
//  Job Responsibilities: ${jobResponsibilities}
//  User Profile Summary:
//  Name: ${profile.personal?.name || "N/A"}
//  Skills: ${profile.skills?.join(", ") || "None"}
//  Work Experience: ${profile.work?.map(w => w.position || "").join(", ")}
//  Education: ${profile.education?.degree || ""} at ${profile.education?.institution || ""}
//  Return only JSON with: { summary, skills, experience_bullets, education }`;
  
//  const out = await chatOnce([
//    { role: 'system', content: GENERATE_SYS },
//    { role: 'user', content: prompt }
//  ]);

//  try {
//    return JSON.parse(out);
//  } catch {
//    console.warn('⚠️ Model returned invalid JSON. Attempting to fix.');
//    const fixed = out.match(/\{[\s\S]*\}/);
//    return fixed ? JSON.parse(fixed[0]) : { summary: "", skills: [], experience_bullets: [] };
//  }
//}

// === PDF GENERATION ===
//function escapeHTML(s) {
//  return String(s || '').replace(/[&<>"']/g, c =>
//    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
//}

//function resumeHTML(profile, resumeData) {
//  const bulletsHTML = (resumeData.experience_bullets || [])
//    .map(b => `<li>${escapeHTML(b)}</li>`)
//    .join('');

//  const skillsHTML = (resumeData.skills || [])
//    .map(s => `<span style="margin-right:8px;">• ${escapeHTML(s)}</span>`)
//    .join('');

//  const eduHTML = (resumeData.education || [])
//    .map(e => `<div>${escapeHTML(e.degree)} – ${escapeHTML(e.institution)} (${escapeHTML(e.year)})</div>`)
//    .join('');

//  return `<!doctype html>
//  <html><head><meta charset="utf-8"><style>
//    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #222; padding: 40px; }
//    h1 { font-size: 22px; margin-bottom: 4px; }
//    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
//    ul { margin-top: 0; padding-left: 20px; }
//    li { margin-bottom: 4px; }
//    .skills span { display: inline-block; }
//  </style></head>
//  <body>
//    <h1>${escapeHTML(profile.personal?.name || 'Name')}</h1>
//    <div>${escapeHTML(profile.personal?.email || '')}</div>
//    <h2>Summary</h2>
//    <p>${escapeHTML(resumeData.summary || '')}</p>
//    <h2>Skills</h2>
//    <div class="skills">${skillsHTML}</div>
//    <h2>Experience Highlights</h2>
//    <ul>${bulletsHTML}</ul>
//    <h2>Education</h2>
//    ${eduHTML}
//  </body></html>`;
//}

//async function renderPDF(userId, resumeData) {
  // Get user profile
//  const userRef = db.collection('users').doc(userId);
//  const snap = await userRef.get();
//  if (!snap.exists) return res.status(404).json({ error: 'User not found' });
//  const profile = snap.data().profile;

//  const html = resumeHTML(profile, resumeData);
//  const filename = `resume-${Date.now()}.pdf`;
//  const outPath = path.join(FILES_DIR, filename);

//  const browser = await puppeteer.launch({ headless: true });
//  const page = await browser.newPage();
//  await page.setContent(html, { waitUntil: 'networkidle0' });
//  await page.pdf({
//    path: outPath,
//    format: 'Letter',
//    printBackground: true,
//    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
//  });
//  await browser.close();
//  return filename;
//}

// === /api/generate ENDPOINT ===
//const GenerateSchema = z.object({
//  userId: z.string(),
//  jobDescription: z.string().min(40),
//  jobResponsibilities: z.string().min(40)
//});

//app.post('/api/generate', async (req, res) => {
//  try {
//    const { userId, jobDescription, jobResponsibilities } = GenerateSchema.parse(req.body);

    // 1. Generate resume
//    const genResume = await resumeGeneration(jobDescription, jobResponsibilities, userId);

    // 2. Render PDF
//    const filename = await renderPDF(userId, genResume);

    // 3. Return result
//    res.json({
//      pdfUrl: `/files/${filename}`,
//      rawResume: genResume
//    });
//  } catch (e) {
//    console.error(e);
//    res.status(500).json({ error: e.message || 'Resume generation failed' });
//  }
//});

// === START SERVER ===
//app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));