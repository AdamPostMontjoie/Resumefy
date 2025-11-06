// backend/server.js

// === IMPORTS ===
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebase.js');
console.log('DEBUG: db object loaded:', db);
console.log('DEBUG: db.collection type:', typeof db.collection);
const puppeteer = require('puppeteer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
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
      temperature: 0.3,
      max_tokens: 16000
    })
  });
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? '';
}

const GENERATE_SYS = `You are a professional resume writer. Generate a tailored resume by selecting and highlighting the most relevant information from the user's profile based on the job description.

INSTRUCTIONS:
1. Extract work experience from the user's profile.work array and create detailed bullet points for each relevant position
2. Select skills from profile.skills that match the job requirements
3. Use the user's education from profile.education
4. Create a compelling summary that connects their background to the job
5. Use active voice, no first-person pronouns
6. Each experience bullet should be specific and achievement-focused
7. Include at least 5-8 experience bullet points from the user's work history
8. Tailor everything to match the job description

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "A 2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "experience_bullets": ["Detailed bullet point 1", "Detailed bullet point 2", "Detailed bullet point 3"],
  "education": [{"degree": "Degree Name", "institution": "School Name", "year": "Year"}]
}

Do NOT include markdown, explanations, or any text outside the JSON object.`;

async function resumeGeneration(jobDescription, jobResponsibilities, userProfile) {
  // Create a more structured prompt with clear formatting
  const prompt = `JOB DESCRIPTION:
${jobDescription}

JOB RESPONSIBILITIES:
${jobResponsibilities}

USER PROFILE DATA:
Name: ${userProfile.personal?.name || 'Not provided'}
Email: ${userProfile.personal?.email || 'Not provided'}
Summary: ${userProfile.Summary || 'Not provided'}

Skills: ${JSON.stringify(userProfile.skills || [])}

Work Experience: ${JSON.stringify(userProfile.work || [])}

Education: ${JSON.stringify(userProfile.education || {})}

Certifications: ${JSON.stringify(userProfile.certifications || [])}

Now generate a tailored resume in valid JSON format.`;

  console.log('Sending request to AI...');
  const out = await chatOnce([
    { role: 'system', content: GENERATE_SYS },
    { role: 'user', content: prompt }
  ]);

  console.log('AI Response:', out.substring(0, 500)); // Log first 500 chars

  try {
    // Try to parse the response
    const cleaned = out.trim();
    let parsed = JSON.parse(cleaned);
    
    // Validate the response has content
    if (!parsed.summary || parsed.summary.length < 10) {
      console.warn('Warning: Summary too short or missing');
    }
    if (!parsed.experience_bullets || parsed.experience_bullets.length === 0) {
      console.warn('Warning: No experience bullets generated');
    }
    
    return parsed;
  } catch (e) {
    console.warn('Model returned invalid JSON. Attempting to fix.', e.message);
    
    // Try to extract JSON from the response
    const jsonMatch = out.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error('Failed to parse extracted JSON');
      }
    }
    
    // Fallback: create a basic resume from the profile data
    console.log('Using fallback resume generation');
    return createFallbackResume(userProfile, jobDescription);
  }
}

// Fallback function to create a basic resume if AI fails
function createFallbackResume(profile, jobDescription) {
  const skills = profile.skills || [];
  const workExperience = profile.work || [];
  const education = profile.education || {};
  
  // Create experience bullets from work history
  const experienceBullets = [];
  workExperience.forEach(job => {
    if (job.title) {
      experienceBullets.push(`${job.title} at ${job.company || 'Company'} - ${job.description || 'Contributed to team success'}`);
    }
    if (job.responsibilities && Array.isArray(job.responsibilities)) {
      experienceBullets.push(...job.responsibilities);
    }
  });
  
  // Create education array
  const educationArray = [];
  if (education.degree) {
    educationArray.push({
      degree: education.degree,
      institution: education.institution || education.school || 'University',
      year: education.year || education.graduationYear || 'N/A'
    });
  }
  
  return {
    summary: profile.Summary || `Experienced professional seeking position in ${jobDescription.substring(0, 50)}...`,
    skills: skills.slice(0, 10),
    experience_bullets: experienceBullets.length > 0 ? experienceBullets : ['Experienced professional with relevant background'],
    education: educationArray
  };
}

// === PDF GENERATION ===
function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function resumeHTML(profile, resumeData) {
  const bulletsHTML = (resumeData.experience_bullets || [])
    .map(b => `<li>${escapeHTML(b)}</li>`)
    .join('');

  const skillsHTML = (resumeData.skills || [])
    .map(s => `<span style="margin-right:8px;">• ${escapeHTML(s)}</span>`)
    .join('');

  const eduHTML = (resumeData.education || [])
    .map(e => `<div style="margin-bottom: 8px;">
      <strong>${escapeHTML(e.degree)}</strong> – ${escapeHTML(e.institution)} 
      <span style="color: #666;">(${escapeHTML(e.year)})</span>
    </div>`)
    .join('');

  // Add certifications if available
  const certHTML = (profile.certifications || [])
    .map(cert => `<li>${escapeHTML(typeof cert === 'string' ? cert : cert.name || '')}</li>`)
    .join('');
  const certSection = certHTML ? `<h2>Certifications</h2><ul>${certHTML}</ul>` : '';

  return `<!doctype html>
  <html><head><meta charset="utf-8"><style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; 
      color: #222; 
      padding: 40px; 
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { 
      font-size: 28px; 
      margin-bottom: 8px; 
      color: #1a1a1a;
      font-weight: 600;
    }
    h2 { 
      font-size: 18px; 
      margin-top: 28px; 
      margin-bottom: 12px; 
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 4px;
      font-weight: 600;
    }
    .contact-info {
      color: #555;
      margin-bottom: 24px;
      font-size: 14px;
    }
    ul { 
      margin-top: 8px; 
      padding-left: 20px; 
    }
    li { 
      margin-bottom: 8px; 
      line-height: 1.5;
    }
    .skills {
      line-height: 1.8;
    }
    .skills span { 
      display: inline-block;
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 4px;
      margin: 4px 4px 4px 0;
      font-size: 14px;
    }
    p {
      margin: 8px 0;
      line-height: 1.6;
    }
  </style></head>
  <body>
    <h1>${escapeHTML(profile.personal?.name || 'Professional Resume')}</h1>
    <div class="contact-info">
      ${escapeHTML(profile.personal?.email || '')}
      ${profile.personal?.phone ? ' • ' + escapeHTML(profile.personal.phone) : ''}
      ${profile.personal?.location ? ' • ' + escapeHTML(profile.personal.location) : ''}
    </div>
    
    <h2>Professional Summary</h2>
    <p>${escapeHTML(resumeData.summary || '')}</p>
    
    <h2>Skills</h2>
    <div class="skills">${skillsHTML || '<p>Skills to be added</p>'}</div>
    
    <h2>Professional Experience</h2>
    <ul>${bulletsHTML || '<li>Experience details to be added</li>'}</ul>
    
    ${certSection}
    
    <h2>Education</h2>
    ${eduHTML || '<p>Education details to be added</p>'}
  </body></html>`;
}

async function renderPDF(profile, resumeData) {
  const html = resumeHTML(profile, resumeData);
  const filename = `resume-${Date.now()}.pdf`;
  const outPath = path.join(FILES_DIR, filename);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.75in', right: '0.75in' }
  });
  await browser.close();
  
  console.log(`PDF generated: ${filename}`);
  return filename;
}

// === /api/generate ENDPOINT ===
const GenerateSchema = z.object({
  userId: z.string(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  jobResponsibilities: z.string().min(10, "Job responsibilities must be at least 10 characters")
});

app.post('/api/generate', async (req, res) => {
  try {
    console.log('Received generation request');
    const { userId, jobDescription, jobResponsibilities } = GenerateSchema.parse(req.body);

    // 1. Get user profile
    const userRef = db.collection('users').doc(userId);
    const snap = await userRef.get();
    if (!snap.exists) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    const profile = snap.data().profile;
    console.log('User profile loaded');

    // 2. Generate resume
    console.log('Generating resume content...');
    const genResume = await resumeGeneration(jobDescription, jobResponsibilities, profile);
    console.log('Resume content generated');
    console.log('Generated resume data:', JSON.stringify(genResume, null, 2));

    // 3. Render PDF
    console.log('Rendering PDF...');
    const filename = await renderPDF(profile, genResume);

    // 4. Return result
    const response = {
      pdfUrl: `http://localhost:${PORT}/files/${filename}`,
      rawResume: genResume
    };
    console.log('Resume generation complete');
    res.json(response);
  } catch (e) {
    console.error('Error in /api/generate:', e);
    if (e.errors) {
      // Zod validation error
      return res.status(400).json({ error: 'Validation error', details: e.errors });
    }
    res.status(500).json({ error: e.message || 'Resume generation failed' });
  }
});

// === START SERVER ===
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));