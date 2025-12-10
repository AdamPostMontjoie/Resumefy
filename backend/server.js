require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { pipeline } = require('@xenova/transformers');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// sentence transformer
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

// --- HELPER: Find data regardless of nesting ---
function findProfileData(data) {
  // 1. Try the new structure (userProfile.profile)
  if (data.userProfile && data.userProfile.profile) return data.userProfile.profile;
  // 2. Try legacy structure (root or profile)
  if (data.profile) return data.profile;
  return data;
}

// for latex generation
function generateLatex(rawDocData) {
  const escapeLatex = (str) =>
    typeof str === 'string'
      ? str.replace(/([#\$%&_\{\}\\])/g, '\\$1')
      : '';

  // 1. Extract Data
  const data = findProfileData(rawDocData);
  
  const personal = data.personal || {};
  const education = data.education || [];
  const work = data.work || [];
  
  // Normalize Projects: Handle both Array (new) and Object (old)
  let projects = [];
  if (Array.isArray(data.projects)) {
    projects = data.projects;
  } else if (data.projects && typeof data.projects === 'object') {
    projects = Object.keys(data.projects).map(k => ({ title: k, ...data.projects[k] }));
  }

  const skills = data.skills || [];
  const escapedSkills = skills.map(s => escapeLatex(s));
  const skillsString = escapedSkills.join(', ');

  // 2. Map variable names (JSON keys) to Variables for the Template
  // We use || to ensure it grabs the data whether it's named 'startDate' OR 'beginningdate'
  
  const fname = personal.firstname || personal['first name'] || "";
  const lname = personal.lastname || personal['last name'] || "";
  
  let latex = `
\\documentclass[letterpaper,11pt]{article}

% ---- Minimal packages ----
\\usepackage[margin=1in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[english]{babel}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}

\\usepackage{setspace}
\\setstretch{0.95}

% ---- Formatting ----
\\setlength{\\tabcolsep}{0pt}
\\raggedright
\\raggedbottom

\\usepackage{titlesec}

\\titleformat{\\section}
  {\\vspace{-4pt}\\scshape\\large} % formatting of section title
  {}                             % label (we don’t use numbering)
  {0em}                          % horizontal separation
  {}                             % before-code (leave empty)
  [\\vspace{1pt}\\titlerule]       % after-code: put line below title


\\pdfgentounicode=1 \\newcommand{\\resumeItem}[1]{ \\item\\small{ {#1 \\vspace{-2pt}} } }

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small #3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.2in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}
\\pagestyle{empty}


%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(fname)} ${escapeLatex(lname)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(personal.phone)} $|$ \\href{mailto:${escapeLatex(personal.email)}}{${escapeLatex(personal.email)}} 
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
`;

  education.forEach((ed) => {
    // Map JSON properties to template
    const start = ed.startDate || ed.beginningdate || "";
    const end = ed.endDate || ed.endingdate || "";
    
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(ed.institution)}} \\hfill ${escapeLatex(ed.location)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(ed.degree)}} \\hfill ${escapeLatex(start)} - ${escapeLatex(end)}
`;
  });

  // experience section
  latex += `\\section{Experience}`;

  work.forEach((job) => {
    // Map JSON properties to template
    const start = job.startDate || job.beginningdate || "";
    const end = job.endDate || job.endingdate || "";
    const items = job.description || job.responsibilities || [];

    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(job.title)}} \\hfill ${escapeLatex(start)} - ${escapeLatex(end)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(job.company)}} \\hfill \\textit{${escapeLatex(job.location)}} 
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt] 
`;
    items.forEach(
      (item) => (latex += `  \\item \\small{${escapeLatex(item)}}\n`)
    );
    latex += `\\end{itemize}`;
  });

  // projects section
  latex += `\\section{Projects}`;

  // Using forEach to handle the normalized projects array
  projects.forEach((proj) => {
    // Map JSON properties to template
    const stack = proj.tools || proj.stack || [];
    const stackStr = Array.isArray(stack) ? stack.join(', ') : stack;
    const details = proj.descriptions || proj.details || [];
    const start = proj.startDate || proj.beginningdate || "";
    const end = proj.endDate || proj.endingdate || "";

    latex += `
\\hspace{0.3cm}\\vspace{0pt}\\textbf{${escapeLatex(proj.title)}} $|$ \\textit{${escapeLatex(stackStr)}} \\hfill ${escapeLatex(start)} - ${escapeLatex(end)}
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt]
`;
    details.forEach(
      (d) => (latex += `  \\item \\small{${escapeLatex(d)}}\n`)
    );
    latex += `\\end{itemize}`;
  });

  // skills section
latex += `\\section{Skills}
\\begin{itemize}[leftmargin=0.2in, label={}, itemsep=0pt]
\\item[] \\small{${skillsString}}
\\end{itemize}
\\end{document}
`;
  return latex;

}

// route to generate the pdf
app.post('/api/generate', async (req, res) => {
  const { userId  } = req.body;
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).send('User not found');

    const data = snap.data();
    const texFile = path.join(__dirname, 'resume.tex');
    const pdfFile = path.join(__dirname, 'resume.pdf');

    fs.writeFileSync(
      texFile,
      generateLatex(data).replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
      'utf8'
    );

    console.log('LaTeX file written at:', texFile);

    exec(
      `/Library/TeX/texbin/pdflatex -interaction=nonstopmode -halt-on-error resume.tex`,
      { cwd: __dirname },
      (err, stdout, stderr) => {
        // Cleanup
        ['resume.aux', 'resume.log', 'resume.tex', 'resume.out'].forEach((f) => {
          const filePath = path.join(__dirname, f);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        if (err) {
          console.error('Latex error:', stdout);
          return res.status(500).send('Resume generation failed!');
        }

        console.log('PDF generated successfully at', pdfFile);
        return res.json({
          message: 'Resume generated successfully!',
          url: 'http://localhost:5005/resume',
        });
      }
    );
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/rank-experience', async (req, res) => {
  const { jobDescription, userId } = req.body;

  if (!jobDescription || !userId)
    return res.status(400).send('Missing jobDescription or userId');

  if (!embedder)
    return res.status(503).send('Embedding model is loading. Try again in a few seconds.');

  try {
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).send('User not found');

    const data = snap.data();
    // Use Helper
    const profile = findProfileData(data);
    const work = profile.work || [];

    // Embed the job description
    const jdVec = (await embedder(jobDescription))[0];

    const scored = [];

    for (const job of work) {
      const responsibilities = job.description || job.responsibilities || [];
      const text = `${job.title} ${job.company} ${responsibilities.join(' ')}`;
      const jobVec = (await embedder(text))[0];

      // cosine similarity
      const dot = jdVec.reduce((sum, v, i) => sum + v * jobVec[i], 0);
      const normA = Math.sqrt(jdVec.reduce((sum, v) => sum + v*v, 0));
      const normB = Math.sqrt(jobVec.reduce((sum, v) => sum + v*v, 0));
      const similarity = dot / (normA * normB);

      scored.push({ job, score: Number(similarity.toFixed(4)) });
    }

    scored.sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (err) {
    console.error('Ranking error:', err);
    res.status(500).send('Error ranking experiences');
  }
});

// serve generated PDF
app.get('/resume', (req, res) => {
  const pdfPath = path.join(__dirname, 'resume.pdf');
  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).send('PDF not found');
  }
});


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
      userProfile: {
        profile: {
            personal: {},
            education: [],
            work: [],
            projects: [],
            skills: []
        }
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
    await userRef.update({ userProfile: newProfile });
    res.status(200).send({ message: "Updated profile" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating profile" });
  }
});

// starting the server
app.listen(5005, () => console.log('Server running at http://localhost:5005'));