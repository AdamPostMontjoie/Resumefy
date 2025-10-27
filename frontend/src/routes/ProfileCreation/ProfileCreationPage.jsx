import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { useAuth } from "../../auth/useAuth";
import "./ProfileCreation.css"; 

const CollapsibleSection = ({ title, children, expandAllTrigger }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (expandAllTrigger) setOpen(true);
  }, [expandAllTrigger]);

  return (
    <section className="collapsible-section">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="collapsible-button"
        aria-expanded={open}
        aria-controls={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div
          className="collapsible-content"
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
    firstname:"",
    lastname:"",
    email: "",
    phone: "",
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

  const {userLoggedIn, currentUser, loading} =  useAuth()
  //redirect if not logged in
   useEffect(()=>{
        function checkAuth(){
          if(!userLoggedIn && !loading){
            navigate('/resumegeneration')
          }
        }
        checkAuth()
    },[userLoggedIn,navigate,loading])
    
  // Load data from db
  useEffect(() => {
    const loadData = async () =>{
      if(userLoggedIn && !loading){
        try {
          const result = await axios.get(`http://localhost:5005/user/${currentUser.uid}`)
          console.log(result)
          //update profile
         const profile = result.data.profile || {};
          const email = result.data.email || "";

          setSummary(profile.Summary || "");
          setPersonalInfo({
            ...(profile.personal || {}),
            email: email
          });
          setEducation(
            profile.education && profile.education.length > 0 
              ? profile.education 
              : [{ institution: "", dates: "", major: "", minor: "", degree: "", gpa: "" }]
          );
          setWorkExperience(
            profile.work && profile.work.length > 0 
              ? profile.work 
              : [{ title: "", company: "", dates: "", description: "", location: "" }]
          );   
          setSkills(
            profile.skills && profile.skills.length > 0 
              ? profile.skills 
              : [""]
          );  
          setCertifications(
            profile.certifications && profile.certifications.length > 0 
              ? profile.certifications 
              : [""]
          );
          setWebsites(
            profile.websites && profile.websites.length > 0 
              ? profile.websites 
              : [""]
          );
        } catch (error) {
          console.log(error)
        }  
      }
    }
    loadData()
  }, [userLoggedIn,loading,currentUser]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setExpandAllTrigger(prev => !prev);
    if (!personalInfo.firstname || !personalInfo.lastname|| !personalInfo.email) {
      alert("Please fill in required fields in Personal Info before submitting.");
    } else {
      try {
        const body = {
            personal : {
              firstname: personalInfo.firstname,
              lastname:personalInfo.lastname,
              phone:personalInfo.phone,
              pronoun:personalInfo.pronoun
            },
            Summary:summary,
            work:workExperience,
            certifications:certifications,
            education:education,
            skills:skills,
            websites:websites
        }
        await axios.put(`http://localhost:5005/profile/${currentUser.uid}`, body)
        alert("updated profile")
        navigate("/resumegeneration");  
      } catch (error) {
        console.error(error)
      }
      
    }

    
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="form">
        <h1 className="title">Profile</h1>
        {/* Personal */}
        <CollapsibleSection title="Personal Info" expandAllTrigger={expandAllTrigger}>
          <div className="input-grid">
            <input name="firstname" placeholder="First Name" value={personalInfo.firstname} onChange={handlePersonalChange} className="input input-half" required />
            <input  name="lastname" placeholder="Last Name" value={personalInfo.lastname} onChange={handlePersonalChange} className="input input-half" required />
            <input disabled name="email" type="email" placeholder="Email" value={personalInfo.email} onChange={handlePersonalChange} className="input input-half" required />
            <input name="phone" placeholder="Phone" value={personalInfo.phone} onChange={handlePersonalChange} className="input input-half" />
            <input name="pronoun" placeholder="Pronoun" value={personalInfo.pronoun} onChange={handlePersonalChange} className="input input-half" />
          </div>
        </CollapsibleSection>
        {/* Education */}
        <CollapsibleSection title="Education" expandAllTrigger={expandAllTrigger}>
          {education.map((edu, index) => (
            <div key={index} className="work-experience-item">
              <input name="institution" placeholder="Institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} className="input" required />
              <div className="input-grid" required>
                <input name="dates" placeholder="Dates" value={edu.dates} onChange={(e) => handleEducationChange(index, e)} className="input input-half" required/>
                <input name="major" placeholder="Major" value={edu.major} onChange={(e) => handleEducationChange(index, e)} className="input input-half" required/>
                <input name="minor" placeholder="Minor" value={edu.minor} onChange={(e) => handleEducationChange(index, e)} className="input input-half" />
                <input name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} className="input input-half" required/>
              </div>
              <input name="gpa" placeholder="GPA" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} className="input input-half" />
              <button type="button" onClick={() => removeEducation(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addEducation} className="add-button">Add Education</button>
        </CollapsibleSection>
          {/*Work */}
        <CollapsibleSection title="Work Experience" expandAllTrigger={expandAllTrigger}>
          {workExperience.map((exp, index) => (
            <div key={index} className="work-experience-item">
              <input name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleWorkChange(index, e)} className="input" required />
              <input name="company" placeholder="Company" value={exp.company} onChange={(e) => handleWorkChange(index, e)} className="input" required />
              <input name="dates" placeholder="Dates" value={exp.dates} onChange={(e) => handleWorkChange(index, e)} className="input" />
              <textarea name="description" placeholder="Description" value={exp.description} onChange={(e) => handleWorkChange(index, e)} className="textarea" required/>
              <input name="location" placeholder="Location" value={exp.location} onChange={(e) => handleWorkChange(index, e)} className="input" />
              <button type="button" onClick={() => removeWork(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWork} className="add-button">Add Work Experience</button>
        </CollapsibleSection>
          {/* Skills */}
        <CollapsibleSection title="Skills" expandAllTrigger={expandAllTrigger}>
          {skills.map((skill, i) => (
            <div key={i} className="list-item-container">
              <input placeholder="Skill" value={skill} onChange={(e) => handleSkillChange(i, e)} className="input input-flex" />
              <button type="button" onClick={() => removeSkill(i)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSkill} className="add-button">Add Skill</button>
        </CollapsibleSection>
          {/*Certs */}
        <CollapsibleSection title="Certifications" expandAllTrigger={expandAllTrigger}>
          {certifications.map((cert, i) => (
            <div key={i} className="list-item-container">
              <input placeholder="Certification name" value={cert} onChange={(e) => handleCertChange(i, e)} className="input input-flex" />
              <button type="button" onClick={() => removeCert(i)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addCert} className="add-button">Add Certification</button>
        </CollapsibleSection>

        <CollapsibleSection title="Websites / Links" expandAllTrigger={expandAllTrigger}>
          {websites.map((url, i) => (
            <div key={i} className="list-item-container">
              <input placeholder="Website or Portfolio URL" value={url} onChange={(e) => handleWebsiteChange(i, e)} className="input input-flex" />
              <button type="button" onClick={() => removeWebsite(i)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWebsite} className="add-button">Add Website</button>
        </CollapsibleSection>

        <CollapsibleSection title="Summary" expandAllTrigger={expandAllTrigger}>
          <textarea
            placeholder="Write a short professional summary or objective..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="textarea"
          />
        </CollapsibleSection>

        <button type="submit" className="submit-button">Submit Profile</button>
      </form>
    </div>
  );
};

export default ProfileCreationPage;