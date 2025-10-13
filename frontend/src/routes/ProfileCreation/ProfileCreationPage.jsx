import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE9D4",
    padding: "1rem",
  },
  form: {
    width: "100%",
    maxWidth: "768px",
    backgroundColor: "#1f2937",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "center",
  },
  collapsibleSection: {
    border: "1px solid #374151",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    backgroundColor: "#374151",
  },
  collapsibleButton: {
    width: "100%",
    backgroundColor: "#4b5563",
    border: "none",
    padding: "0.75rem",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "0.5rem 0.5rem 0 0",
  },
  collapsibleContent: {
    padding: "1rem",
    backgroundColor: "#1f2937",
  },
  inputGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  inputHalf: {
    flex: "1 1 45%",
    minWidth: "200px",
  },
  inputFull: {
    flex: "1 1 100%",
  },
  input: {
    backgroundColor: "#1f2937",
    color: "white",
    border: "1px solid #374151",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    backgroundColor: "#1f2937",
    color: "white",
    border: "1px solid #374151",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "80px",
  },
  workExperienceItem: {
    border: "1px solid #374151",
    backgroundColor: "#1f2937",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  removeButton: {
    color: "#f87171",
    textDecoration: "underline",
    fontSize: "0.875rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    alignSelf: "flex-end",
    padding: 0,
  },
  addButton: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    marginTop: "0.5rem",
    alignSelf: "flex-start",
  },
  submitButton: {
    backgroundColor: "#16a34a",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    alignSelf: "center",
    marginTop: "1rem",
  },
  clearButton: {
    backgroundColor: "#dc2626", 
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    alignSelf: "center",
    marginTop: "0.5rem",
  },
};

const CollapsibleSection = ({ title, children }) => {

  const [open, setOpen] = useState(true);
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

  const navigate = useNavigate();

  // Load from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.workExperience) setWorkExperience(parsed.workExperience);
        if (parsed.skills) setSkills(parsed.skills);
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

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...education];
    updated[index][name] = value;
    setEducation(updated);
  };

  const handleWorkChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...workExperience];
    updated[index][name] = value;
    setWorkExperience(updated);
  };

  const handleSkillChange = (index, e) => {
    const updated = [...skills];
    updated[index] = e.target.value;
    setSkills(updated);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { institution: "", dates: "", major: "", minor: "", degree: "", gpa: "" },
    ]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addWork = () => {
    setWorkExperience([
      ...workExperience,
      { title: "", company: "", dates: "", description: "", location: "" },
    ]);
  };

  const removeWork = (index) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const addSkill = () => setSkills([...skills, ""]);
  const removeSkill = (index) => setSkills(skills.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { personalInfo, education, workExperience, skills };
    localStorage.setItem("profileData", JSON.stringify(data));
    alert("Profile saved successfully to localStorage!");
    navigate("/resumegeneration");
  };

  return (
    <div style={styles.pageContainer}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Profile</h1>

        {/* Personal Info */}
        <CollapsibleSection title="Personal Info">
          <div style={styles.inputGrid}>
            <input
              name="name"
              placeholder="Full Name"
              value={personalInfo.name}
              onChange={handlePersonalChange}
              style={{ ...styles.input, ...styles.inputHalf }}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={personalInfo.email}
              onChange={handlePersonalChange}
              style={{ ...styles.input, ...styles.inputHalf }}
              required
            />
            <input
              name="phone"
              placeholder="Phone"
              value={personalInfo.phone}
              onChange={handlePersonalChange}
              style={{ ...styles.input, ...styles.inputHalf }}
            />
            <input
              name="pronoun"
              placeholder="Pronoun"
              value={personalInfo.pronoun}
              onChange={handlePersonalChange}
              style={{ ...styles.input, ...styles.inputHalf }}
            />
            <input
              name="address"
              placeholder="Address (optional)"
              value={personalInfo.address}
              onChange={handlePersonalChange}
              style={{ ...styles.input, ...styles.inputFull }}
            />
          </div>
        </CollapsibleSection>

        {/* Education */}
        <CollapsibleSection title="Education">
          {education.map((edu, index) => (
            <div key={index} style={styles.workExperienceItem}>
              <input
                name="institution"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, e)}
                style={styles.input}
                required
              />
              <div style={styles.inputGrid}>
                <input
                  name="dates"
                  placeholder="Dates"
                  value={edu.dates}
                  onChange={(e) => handleEducationChange(index, e)}
                  style={{ ...styles.input, ...styles.inputHalf }}
                />
                <input
                  name="major"
                  placeholder="Major"
                  value={edu.major}
                  onChange={(e) => handleEducationChange(index, e)}
                  style={{ ...styles.input, ...styles.inputHalf }}
                />
                <input
                  name="minor"
                  placeholder="Minor"
                  value={edu.minor}
                  onChange={(e) => handleEducationChange(index, e)}
                  style={{ ...styles.input, ...styles.inputHalf }}
                />
                <input
                  name="degree"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, e)}
                  style={{ ...styles.input, ...styles.inputHalf }}
                />
              </div>
              <input
                name="gpa"
                placeholder="GPA"
                value={edu.gpa}
                onChange={(e) => handleEducationChange(index, e)}
                style={{ ...styles.input, ...styles.inputHalf }}
              />
              {education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addEducation} style={styles.addButton}>
            Add Education
          </button>
        </CollapsibleSection>

        {/* Work Experience */}
        <CollapsibleSection title="Work Experience">
          {workExperience.map((exp, index) => (
            <div key={index} style={styles.workExperienceItem}>
              <input
                name="title"
                placeholder="Job Title"
                value={exp.title}
                onChange={(e) => handleWorkChange(index, e)}
                style={styles.input}
                required
              />
              <input
                name="company"
                placeholder="Company"
                value={exp.company}
                onChange={(e) => handleWorkChange(index, e)}
                style={styles.input}
                required
              />
              <input
                name="dates"
                placeholder="Dates"
                value={exp.dates}
                onChange={(e) => handleWorkChange(index, e)}
                style={styles.input}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={exp.description}
                onChange={(e) => handleWorkChange(index, e)}
                style={styles.textarea}
              />
              <input
                name="location"
                placeholder="Location"
                value={exp.location}
                onChange={(e) => handleWorkChange(index, e)}
                style={styles.input}
              />
              {workExperience.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addWork} style={styles.addButton}>
            Add Work Experience
          </button>
        </CollapsibleSection>

        {/* Skills */}
        <CollapsibleSection title="Skills">
          {skills.map((skill, index) => (
            <div key={index} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Skill"
                value={skill}
                onChange={(e) => handleSkillChange(index, e)}
                style={{ ...styles.input, flex: 1 }}
              />
              {skills.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSkill} style={styles.addButton}>
            Add Skill
          </button>
        </CollapsibleSection>

        <button type="submit" style={styles.submitButton}>
          Submit Profile
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("profileData");
            window.location.reload();
            
          }}
          style={styles.clearButton}
        >
          Clear Saved Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileCreationPage;
