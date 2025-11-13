require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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


// for latex generation
function generateLatex(data) {
  const personal = data.personal || {};
  const education = data.education || [];
  const work = data.work || [];
  const projects = data.projects || {};
  const skills = data['technical skills'] || {};


//making sure special characters doesnt affect the pdf from generating
  const escapeLatex = (str) =>
    typeof str === 'string'
      ? str.replace(/([#\$%&_\{\}\\])/g, '\\$1')
      : '';

  let latex = `
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

%----------PAGE SETUP----------
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting to match template
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure PDF is ATS-readable
\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\
      \\textit{\\small#3} & \\textit{\\small #4} \\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(personal['first name'])} ${escapeLatex(personal['last name'])}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(personal.phone)} $|$ \\href{mailto:${escapeLatex(personal.email)}}{${escapeLatex(personal.email)}} $|$ 
    \\href{${escapeLatex(personal.linkedin)}}{${escapeLatex(personal.linkedin)}} $|$
    \\href{${escapeLatex(personal.github)}}{${escapeLatex(personal.github)}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
`;

  education.forEach((ed) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(ed.institution)}} \\hfill ${escapeLatex(ed.location)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(ed.degree)}} \\hfill \\textit{${escapeLatex(ed.dates)}} 
`;
  });

  // experience section
  latex += `\\section{Experience}`;

  work.forEach((job) => {
    latex += `
\\hspace{0.3cm} \\textbf{${escapeLatex(job.title)}} \\hfill ${escapeLatex(job.dates)} \\\\
\\hspace{0.3cm} \\textit{${escapeLatex(job.company)}} \\hfill \\textit{${escapeLatex(job.location)}} 
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt] 
`;
    (job.responsibilities || []).forEach(
      (item) => (latex += `  \\item \\small{${escapeLatex(item)}}\n`)
    );
    latex += `\\end{itemize}`;
  });

  // projects section
  latex += `\\section{Projects}`;

  for (let key in projects) {
    const proj = projects[key];
    latex += `
\\hspace{0.3cm}\\vspace{0pt}\\textbf{${escapeLatex(key)}} $|$ \\textit{${escapeLatex(
      proj.stack
    )}} \\hfill ${escapeLatex(proj.dates)} 
\\hspace{0.3cm}\\begin{itemize}[leftmargin=0.4in, label={$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}, itemsep=0pt]
`;
    (proj.details || []).forEach(
      (d) => (latex += `  \\item \\small{${escapeLatex(d)}}\n`)
    );
    latex += `\\end{itemize}`;
  }

  // skills section
  latex += `\\section{Skills}
\\begin{itemize}[leftmargin=0.1in, label={}, itemsep=0pt]
\\item[]\\small{\\textbf{Languages:} ${escapeLatex(skills.languages)}} \\\\
\\item[]\\small{\\textbf{Frameworks:} ${escapeLatex(skills.frameworks)}} \\\\
\\item[]\\small{\\textbf{Developer Tools:} ${escapeLatex(skills['developer tools'])}} \\\\
\\item[]\\small{\\textbf{Libraries:} ${escapeLatex(skills.libraries)}}
\\end{itemize}

\\end{document}
`;

  return latex;
}

// route to generate the pdf
app.post('/api/generate', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).send('User not found');

    const data = snap.data();
    const texFile = path.join(__dirname, 'resume.tex');
    const pdfFile = path.join(__dirname, 'resume.pdf');

    fs.writeFileSync(texFile, generateLatex(data), 'utf8');
    console.log('LaTeX file written at:', texFile);

    exec(
      `/Library/TeX/texbin/pdflatex -interaction=nonstopmode resume.tex`,
      { cwd: __dirname },
      (err, stdout, stderr) => {
        console.log('LaTeX stdout:', stdout);
        console.log('LaTeX stderr:', stderr);

        // since the pdf is generated using latex, it causes extra 
        // files such as aux, log, and tex files to be generted and 
        // downloaded as well. these lines here to clean up the auxiliary files safely
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
    console.error('Error generating resume:', error);
    res.status(500).send('Internal server error');
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

// starting the server
app.listen(5005, () => console.log('Server running at http://localhost:5005'));


