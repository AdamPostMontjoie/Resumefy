require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { pipeline } = require('@xenova/transformers');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const axios = require('axios');

// sentence transformer (kept for local ranking endpoint if needed)
let embedder;
(async () => {
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Embedding model loaded');
})();

const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// === HELPER: Map DB Data to Strict Python API Schema ===
function mapToApiSchema(dbData) {
  // 1. Find the raw profile object (handling nesting)
  const raw = dbData.profile || dbData.userProfile?.profile || dbData;

  // 2. Map Personal Info
  const p = raw.personal || {};
  const personal = {
    firstname: p.firstname || p.firstName || p['first name'] || "Jane",
    lastname: p.lastname || p.lastName || p['last name'] || "Doe",
    phone: p.phone || p.phoneNumber || "",
    email: p.email || "no-email@example.com",
    github: p.github || p.gitHub || null,
    linkedin: p.linkedin || p.linkedIn || null
  };

  // 3. Map Work Items (Strictly map 'responsibilities' -> 'description')
  const work = (raw.work || []).map(w => ({
    title: w.title || "Untitled",
    company: w.company || "Unknown",
    startDate: w.startDate || w.beginningdate || "",
    endDate: w.endDate || w.endingdate || "",
    location: w.location || "",
    // Python model expects List[str] called 'description'
    description: Array.isArray(w.description) ? w.description : (w.responsibilities || [])
  }));

  // 4. Map Project Items (Strictly map 'stack' -> 'tools', 'details' -> 'descriptions')
  let rawProjects = [];
  if (Array.isArray(raw.projects)) {
    rawProjects = raw.projects;
  } else if (raw.projects && typeof raw.projects === 'object') {
    rawProjects = Object.keys(raw.projects).map(k => ({ title: k, ...raw.projects[k] }));
  }

  const projects = rawProjects.map(proj => ({
    title: proj.title || "Untitled",
    startDate: proj.startDate || proj.beginningdate || "",
    endDate: proj.endDate || proj.endingdate || "",
    // Python model expects List[str] called 'tools'
    tools: Array.isArray(proj.tools) ? proj.tools : (proj.stack || []),
    // Python model expects List[str] called 'descriptions' (PLURAL)
    descriptions: Array.isArray(proj.descriptions) ? proj.descriptions : (proj.details || [])
  }));

  // 5. Map Education
  const education = (raw.education || []).map(edu => ({
    institution: edu.institution || edu.school || "Unknown",
    startDate: edu.startDate || "",
    endDate: edu.endDate || "",
    major: edu.major || "",
    minor: edu.minor || "",
    degree: edu.degree || "",
    location: edu.location || ""
  }));

  return {
    personal,
    work,
    projects,
    education,
    skills: raw.skills || []
  };
}

// === LATEX GENERATOR ===
// Uses the standardized output from the Python API
function generateLatex(data) {
  const escapeLatex = (str) => typeof str === 'string' ? str.replace(/([#\$%&_\{\}\\])/g, '\\$1') : '';

  const personal = data.personal || {};
  const education = data.education || [];
  const work = data.work || [];
  const projects = data.projects || [];
  const skills = data.skills || [];
  const skillsString = skills.map(s => escapeLatex(s)).join(', ');

  let latex = `
\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[english]{babel}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{setspace}
\\setstretch{0.95}

\\setlength{\\tabcolsep}{0pt}
\\raggedright
\\raggedbottom

\\usepackage{titlesec}
\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\large}{}{0em}{}[\\vspace{1pt}\\titlerule]

\\pdfgentounicode=1 
\\newcommand{\\resumeItem}[1]{ \\item\\small{ {#1 \\vspace{-2pt}} } }

\\begin{document}
\\pagestyle{empty}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(personal.firstname)} ${escapeLatex(personal.lastname)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(personal.phone)} $|$ \\href{mailto:${escapeLatex(personal.email)}}{${escapeLatex(personal.email)}}   $|$ 
    \\href{${escapeLatex(personal.linkedin)}}{${escapeLatex(personal.linkedin)}} $|$
    \\href{${escapeLatex(personal.github)}}{${escapeLatex(personal.github)}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
`;

  education.forEach((ed) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(ed.institution)}} \\hfill ${escapeLatex(ed.location)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(ed.degree)} ${ed.major ? 'in ' + escapeLatex(ed.major) : ''}} \\hfill ${escapeLatex(ed.startDate)} - ${escapeLatex(ed.endDate)}
`;
  });

  latex += `\\section{Experience}`;
  work.forEach((job) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(job.title)}} \\hfill ${escapeLatex(job.startDate)} - ${escapeLatex(job.endDate)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(job.company)}} \\hfill \\textit{${escapeLatex(job.location)}} 
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt] 
`;
    // Python model guarantees 'description' is the list key
    (job.description || []).forEach(item => latex += `  \\item \\small{${escapeLatex(item)}}\n`);
    latex += `\\end{itemize}`;
  });

  latex += `\\section{Projects}`;
  projects.forEach((proj) => {
    // Python model guarantees 'tools' and 'descriptions' keys
    const stack = (proj.tools || []).join(', ');
    latex += `
\\hspace{0.3cm}\\vspace{0pt}\\textbf{${escapeLatex(proj.title)}} $|$ \\textit{${escapeLatex(stack)}} \\hfill ${escapeLatex(proj.startDate)} - ${escapeLatex(proj.endDate)}
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt]
`;
    (proj.descriptions || []).forEach(d => latex += `  \\item \\small{${escapeLatex(d)}}\n`);
    latex += `\\end{itemize}`;
  });

  latex += `\\section{Skills}
\\begin{itemize}[leftmargin=0.2in, label={}, itemsep=0pt]
\\item[] \\small{${skillsString}}
\\end{itemize}
\\end{document}
`;
  return latex;
}

// === API ROUTES ===
app.post('/api/generate', async (req, res) => {
  const { userId, title, description } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    // 1. Fetch from Firebase
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found' });
    const docData = snap.data();

    // 2. Map to Strict Python API Schema
    const mappedProfile = mapToApiSchema(docData);

    // 3. Prepare Payload for Python API
    const payload = {
      user_profile: mappedProfile,
      new_job: { title, description }
    };

    console.log("Sending payload to ranker...");

    let optimizedProfile;
    try {
      const response = await axios.post(
        "https://resume-ranker-340638164003.us-central1.run.app/",
        payload
      );
      optimizedProfile = response.data;
    } catch (err) {
      console.error("Python API error:", err.message || err);
      return res.status(500).json({
        message: 'Failed to call Python ranking API',
        details: err.response?.data || err.message
      });
    }

    // 4. Generate LaTeX and write to file
    const texFile = path.join(__dirname, 'resume.tex');
    const pdfFile = path.join(__dirname, 'resume.pdf');

    const texContent = generateLatex(optimizedProfile).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    fs.writeFileSync(texFile, texContent, 'utf8');

    const pdflatex =
      process.platform === 'win32'
        ? 'pdflatex.exe'
        : '/Library/TeX/texbin/pdflatex';

    // 5. Compile LaTeX
    exec(
      `${pdflatex} -interaction=nonstopmode -halt-on-error resume.tex`,
      { cwd: __dirname },
      (err, stdout, stderr) => {
        console.log('pdflatex stdout:', stdout);
        console.log('pdflatex stderr:', stderr);

        if (err) {
          return res.status(500).json({
            message: 'Resume generation failed!',
            latexError: stderr || stdout
          });
        }

        // 6. Clean up auxiliary files (keep PDF)
        ['resume.aux', 'resume.log', 'resume.out', 'resume.tex'].forEach(f => {
          const filePath = path.join(__dirname, f);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        return res.json({
          message: 'Resume generated!',
          url: 'http://localhost:5005/resume'
        });
      }
    );

  } catch (error) {
    console.error('Server error:', error);
    // Always return JSON with error details
    res.status(500).json({
      message: 'Internal server error',
      details: error.response?.data || error.message || error.toString()
    });
  }
});

// app.post('/api/rank-experience', async (req, res) => {
//   const { jobDescription, userId } = req.body;
//   if (!jobDescription || !userId) return res.status(400).send('Missing data');
//   if (!embedder) return res.status(503).send('Model loading');

//   try {
//     const snap = await db.collection('users').doc(userId).get();
//     if (!snap.exists) return res.status(404).send('User not found');
    
//     // Use the mapped profile to ensure we get 'description' correctly
//     const mapped = mapToApiSchema(snap.data());
//     const work = mapped.work || [];

//     const jdVec = (await embedder(jobDescription))[0];
//     const scored = [];

//     for (const job of work) {
//       const text = `${job.title} ${job.company} ${(job.description || []).join(' ')}`;
//       const jobVec = (await embedder(text))[0];
//       const dot = jdVec.reduce((sum, v, i) => sum + v * jobVec[i], 0);
//       const normA = Math.sqrt(jdVec.reduce((sum, v) => sum + v*v, 0));
//       const normB = Math.sqrt(jobVec.reduce((sum, v) => sum + v*v, 0));
//       scored.push({ job, score: Number((dot / (normA * normB)).toFixed(4)) });
//     }
//     res.json(scored.sort((a, b) => b.score - a.score));
//   } catch (err) { console.error(err); res.status(500).send('Error ranking'); }
// });

// serve generated PDF
app.get('/resume', (req, res) => {
  const pdfPath = path.join(__dirname, 'resume.pdf');
  if (fs.existsSync(pdfPath)) res.sendFile(pdfPath);
  else res.status(404).send('PDF not found');
});

app.get('/user/:id', async (req, res) => {
  const user = await db.collection('users').doc(req.params.id).get();
  user.exists ? res.send(user.data()) : res.status(404).send({message: "User not found"});
});

app.post('/register', async (req, res) => {
  await db.collection('users').doc(req.body.id).set({
    email: req.body.email,
    profile: { personal: {}, education: [], work: [], projects: [], skills: [] }
  });
  res.status(201).send({ message: "Created user" });
});

app.put('/profile/:id', async (req, res) => {
  await db.collection('users').doc(req.params.id).update({ profile: req.body });
  res.status(200).send({ message: "Updated" });
});

app.listen(5005, () => console.log('Server running at http://localhost:5005'));