import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#111827",
    padding: "2rem",
  },
  form: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "#ffffffff",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    color: "#111827",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    transition: "transform 0.2s ease",
  },
  title: {
    color: "#111827",
    fontSize: "2.25rem",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "-0.02em",
  },
  collapsibleSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    backgroundColor: "#f9fafb",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  collapsibleButton: {
    width: "100%",
    backgroundColor: "#667eea",
    border: "none",
    padding: "1rem",
    fontWeight: "600",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.1rem",
    transition: "background-color 0.2s ease",
  },
  collapsibleContent: {
    padding: "1.25rem",
    backgroundColor: "#ffffff",
  },
  inputGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  inputHalf: {
    flex: "1 1 48%",
    minWidth: "240px",
  },
  inputFull: {
    flex: "1 1 100%",
  },
  input: {
    backgroundColor: "#f9fafb",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    width: "100%",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  textarea: {
    backgroundColor: "#f9fafb",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "100px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  workExperienceItem: {
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: "0.75rem",
    marginBottom: "1rem",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  removeButton: {
    color: "#dc2626",
    fontWeight: "500",
    textDecoration: "underline",
    fontSize: "0.9rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  addButton: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "0.6rem 1.25rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "0.75rem",
    alignSelf: "flex-start",
    transition: "background-color 0.2s ease",
  },
  submitButton: {
    backgroundColor: "#111827",
    color: "white",
    padding: "0.9rem 2rem",
    borderRadius: "0.75rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    alignSelf: "center",
    marginTop: "1rem",
    fontSize: "1.1rem",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
  clearButton: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "0.9rem 2rem",
    borderRadius: "0.75rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    alignSelf: "center",
    marginTop: "0.75rem",
    fontSize: "1.1rem",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
};

// Collapsible Section Component
const CollapsibleSection = ({ title, children, expandAllTrigger }) => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (expandAllTrigger) setOpen(true);
  }, [expandAllTrigger]);

  return (
    <section style={styles.collapsibleSection}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={styles.collapsibleButton}
        aria-expanded={open}
        aria-controls={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div
          style={styles.collapsibleContent}
          id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {children}
        </div>
      )}
    </section>
  );
};

const ProfileCreationPage = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pronoun: "",
  });

  const [education, setEducation] = useState([
    { institution: "", dates: "", major: "", minor: "", degree: "", gpa: "" },
  ]);
  const [workExperience, setWorkExperience] = useState([
    { title: "", company: "", dates: "", description: "", location: "" },
  ]);
  const [skills, setSkills] = useState([""]);

  // New sections
  const [certifications, setCertifications] = useState([""]);
  const [websites, setWebsites] = useState([""]);
  const [summary, setSummary] = useState("");

  const [expandAllTrigger, setExpandAllTrigger] = useState(false);
  const navigate = useNavigate();

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.workExperience) setWorkExperience(parsed.workExperience);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.certifications) setCertifications(parsed.certifications);
        if (parsed.websites) setWebsites(parsed.websites);
        if (parsed.summary) setSummary(parsed.summary);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
  }, []);

  // Handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };
  const handleEducationChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...education];
    updated[i][name] = value;
    setEducation(updated);
  };
  const handleWorkChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...workExperience];
    updated[i][name] = value;
    setWorkExperience(updated);
  };
  const handleSkillChange = (i, e) => {
    const updated = [...skills];
    updated[i] = e.target.value;
    setSkills(updated);
  };
  const handleCertChange = (i, e) => {
    const updated = [...certifications];
    updated[i] = e.target.value;
    setCertifications(updated);
  };
  const handleWebsiteChange = (i, e) => {
    const updated = [...websites];
    updated[i] = e.target.value;
    setWebsites(updated);
  };

  // Add/remove
  const addEducation = () => setEducation([...education, { institution: "", dates: "", major: "", minor: "", degree: "", gpa: "" }]);
  const removeEducation = (i) => setEducation(education.filter((_, x) => x !== i));
  const addWork = () => setWorkExperience([...workExperience, { title: "", company: "", dates: "", description: "", location: "" }]);
  const removeWork = (i) => setWorkExperience(workExperience.filter((_, x) => x !== i));
  const addSkill = () => setSkills([...skills, ""]);
  const removeSkill = (i) => setSkills(skills.filter((_, x) => x !== i));
  const addCert = () => setCertifications([...certifications, ""]);
  const removeCert = (i) => setCertifications(certifications.filter((_, x) => x !== i));
  const addWebsite = () => setWebsites([...websites, ""]);
  const removeWebsite = (i) => setWebsites(websites.filter((_, x) => x !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    setExpandAllTrigger(prev => !prev);
    if (!personalInfo.name || !personalInfo.email) {
      alert("Please fill in required fields in Personal Info before submitting.");
      return;
    }

    const profile = { personalInfo, education, workExperience, skills, certifications, websites, summary };
    localStorage.setItem("profileData", JSON.stringify(profile));
    alert("Profile saved successfully to localStorage!");
    navigate("/resumegeneration");
  };

  return (
    <div style={styles.pageContainer}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Profile</h1>

        {/* Personal Info */}
        <CollapsibleSection title="Personal Info" expandAllTrigger={expandAllTrigger}>
          <div style={styles.inputGrid}>
            <input name="name" placeholder="Full Name" value={personalInfo.name} onChange={handlePersonalChange} style={{ ...styles.input, ...styles.inputHalf }} required />
            <input name="email" type="email" placeholder="Email" value={personalInfo.email} onChange={handlePersonalChange} style={{ ...styles.input, ...styles.inputHalf }} required />
            <input name="phone" placeholder="Phone" value={personalInfo.phone} onChange={handlePersonalChange} style={{ ...styles.input, ...styles.inputHalf }} />
            <input name="pronoun" placeholder="Pronoun" value={personalInfo.pronoun} onChange={handlePersonalChange} style={{ ...styles.input, ...styles.inputHalf }} />
            <input name="address" placeholder="Address (optional)" value={personalInfo.address} onChange={handlePersonalChange} style={{ ...styles.input, ...styles.inputFull }} />
          </div>
        </CollapsibleSection>

        {/* Education */}
        <CollapsibleSection title="Education" expandAllTrigger={expandAllTrigger}>
          {education.map((edu, index) => (
            <div key={index} style={styles.workExperienceItem}>
              <input name="institution" placeholder="Institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} style={styles.input} required />
              <div style={styles.inputGrid} required>
                <input name="dates" placeholder="Dates" value={edu.dates} onChange={(e) => handleEducationChange(index, e)} style={{ ...styles.input, ...styles.inputHalf }} required/>
                <input name="major" placeholder="Major" value={edu.major} onChange={(e) => handleEducationChange(index, e)} style={{ ...styles.input, ...styles.inputHalf }} required/>
                <input name="minor" placeholder="Minor" value={edu.minor} onChange={(e) => handleEducationChange(index, e)} style={{ ...styles.input, ...styles.inputHalf }} />
                <input name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} style={{ ...styles.input, ...styles.inputHalf }} required/>
              </div>
              <input name="gpa" placeholder="GPA" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} style={{ ...styles.input, ...styles.inputHalf }} />
              <button type="button" onClick={() => removeEducation(index)} style={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addEducation} style={styles.addButton}>Add Education</button>
        </CollapsibleSection>

        {/* Work Experience */}
        <CollapsibleSection title="Work Experience" expandAllTrigger={expandAllTrigger}>
          {workExperience.map((exp, index) => (
            <div key={index} style={styles.workExperienceItem}>
              <input name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleWorkChange(index, e)} style={styles.input} required />
              <input name="company" placeholder="Company" value={exp.company} onChange={(e) => handleWorkChange(index, e)} style={styles.input} required />
              <input name="dates" placeholder="Dates" value={exp.dates} onChange={(e) => handleWorkChange(index, e)} style={styles.input} />
              <textarea name="description" placeholder="Description" value={exp.description} onChange={(e) => handleWorkChange(index, e)} style={styles.textarea} required/>
              <input name="location" placeholder="Location" value={exp.location} onChange={(e) => handleWorkChange(index, e)} style={styles.input} />
              <button type="button" onClick={() => removeWork(index)} style={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWork} style={styles.addButton}>Add Work Experience</button>
        </CollapsibleSection>

        {/* Skills */}
        <CollapsibleSection title="Skills" expandAllTrigger={expandAllTrigger}>
          {skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <input placeholder="Skill" value={skill} onChange={(e) => handleSkillChange(i, e)} style={{ ...styles.input, flex: 1 }} />
              <button type="button" onClick={() => removeSkill(i)} style={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSkill} style={styles.addButton}>Add Skill</button>
        </CollapsibleSection>

        {/* Certifications */}
        <CollapsibleSection title="Certifications" expandAllTrigger={expandAllTrigger}>
          {certifications.map((cert, i) => (
            <div key={i} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <input placeholder="Certification name" value={cert} onChange={(e) => handleCertChange(i, e)} style={{ ...styles.input, flex: 1 }} required/>
              <button type="button" onClick={() => removeCert(i)} style={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addCert} style={styles.addButton}>Add Certification</button>
        </CollapsibleSection>

        {/* Websites */}
        <CollapsibleSection title="Websites / Links" expandAllTrigger={expandAllTrigger}>
          {websites.map((url, i) => (
            <div key={i} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <input placeholder="Website or Portfolio URL" value={url} onChange={(e) => handleWebsiteChange(i, e)} style={{ ...styles.input, flex: 1 }} required/>
              <button type="button" onClick={() => removeWebsite(i)} style={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWebsite} style={styles.addButton}>Add Website</button>
        </CollapsibleSection>

        {/* Summary */}
        <CollapsibleSection title="Summary" expandAllTrigger={expandAllTrigger}>
          <textarea
            placeholder="Write a short professional summary or objective..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={styles.textarea}
          />
        </CollapsibleSection>

        <button type="submit" style={styles.submitButton}>✨Submit Profile</button>
        <button type="button" onClick={() => { localStorage.removeItem("profileData"); window.location.reload(); }} style={styles.clearButton}>🗑️Clear Saved Profile</button>
      </form>
    </div>
  );
};

export default ProfileCreationPage;
