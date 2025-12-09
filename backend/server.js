require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const axios = require('axios'); 
const cors = require('cors');

const app = express();

// --- CONFIGURATION ---
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

app.use(cors());
app.use(express.json());

// --- LATEX GENERATOR (Matches Python Pydantic Structure) ---
function generateLatex(data) {
  const escapeLatex = (str) =>
    typeof str === 'string'
      ? str.replace(/([#\$%&_\{\}\\])/g, '\\$1')
      : '';


  const personal = data.personal || {};
  const education = data.education || [];
  const work = data.work || [];
  const projects = data.projects || []; 
  const skills = data.skills || [];
  
  const escapedSkills = skills.map(s => escapeLatex(s));
  const skillsString = escapedSkills.join(', ');

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
    \\small ${escapeLatex(personal.phone)} $|$ \\href{mailto:${escapeLatex(personal.email)}}{${escapeLatex(personal.email)}} 
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
`;

  education.forEach((ed) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(ed.institution)}} \\hfill ${escapeLatex(ed.location)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(ed.degree)}} \\hfill ${escapeLatex(ed.startDate)} - ${escapeLatex(ed.endDate)}
`;
  });

  //-----------EXPERIENCE-----------
  latex += `\\section{Experience}`;
  work.forEach((job) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(job.title)}} \\hfill ${escapeLatex(job.startDate)} - ${escapeLatex(job.endDate)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(job.company)}} \\hfill \\textit{${escapeLatex(job.location)}} 
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt] 
`;
    // Python sends 'description' as a list
    (job.description || []).forEach(
      (item) => (latex += `  \\item \\small{${escapeLatex(item)}}\n`)
    );
    latex += `\\end{itemize}`;
  });

  //-----------PROJECTS-----------
  latex += `\\section{Projects}`;
  projects.forEach((proj) => {
    // Python sends 'tools' as a list
    const stackString = (proj.tools || []).join(', ');
    
    latex += `
\\hspace{0.3cm}\\vspace{0pt}\\textbf{${escapeLatex(proj.title)}} $|$ \\textit{${escapeLatex(stackString)}} \\hfill ${escapeLatex(proj.startDate)} - ${escapeLatex(proj.endDate)}
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt]
`;

    (proj.descriptions || []).forEach(
      (d) => (latex += `  \\item \\small{${escapeLatex(d)}}\n`)
    );
    latex += `\\end{itemize}`;
  });

  //-----------SKILLS-----------
  latex += `\\section{Skills}
\\begin{itemize}[leftmargin=0.2in, label={}, itemsep=0pt]
\\item[] \\small{${skillsString}}
\\end{itemize}
\\end{document}
`;
  return latex;
}

// === ROUTES ===

app.get('/', (req, res) => res.send('Backend is running!'));

// route to generate the pdf
app.post('/api/generate', async (req, res) => {
  const { userProfile, jobTitle, jobDescription } = req.body;
  

  const pythonPayload = {
  
    user_profile: userProfile.profile, 
    new_job: {
      title: jobTitle,
      description: jobDescription
    }
  };

  try {
    const response = await axios.post("https://resume-ranker-340638164003.us-central1.run.app/", pythonPayload);
    
    const rankedProfile = response.data;

    if (!rankedProfile) return res.status(400).send('Failed to rank resume');

    const texFile = path.join(__dirname, 'resume.tex');
    const pdfFile = path.join(__dirname, 'resume.pdf');

    fs.writeFileSync(
      texFile,
      generateLatex(rankedProfile).replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
      'utf8'
    );

    console.log('LaTeX file written at:', texFile);

    exec(
      `/Library/TeX/texbin/pdflatex -interaction=nonstopmode resume.tex`,
      { cwd: __dirname },
      (err, stdout, stderr) => {
        // cleanup
        ['resume.aux', 'resume.log', 'resume.tex', 'resume.out'].forEach((f) => {
          const filePath = path.join(__dirname, f);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        if (err) {
          console.error('Latex error:', stderr);
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
    // IMPROVED ERROR LOGGING
    // This will print the specific reason Python rejected the data (e.g., "missing field 'firstname'")
    if (error.response) {
      console.error('Python Server Error:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).send(error.response.data);
    } else {
      console.error('Error generating resume:', error.message);
      return res.status(500).send('Internal server error');
    }
  }
});

app.get('/resume', (req, res) => {
  const pdfPath = path.join(__dirname, 'resume.pdf');
  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).send('PDF not found');
  }
});

// starting the server
app.listen(5005, () => console.log('Server running at http://localhost:5005'));