import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { useAuth } from "../../auth/useAuth";
import "./ProfileCreation.css"; 
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import institutions from './us_institutions.json'
import degrees from './degrees.json'
import majors from './majors.json'
import logo from "../../assets/logo.png";


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
  const [collegeList,setCollegeList] = useState([])
  const [degreesList, setDegreesList] = useState([])
  const [majorsList, setMajorsList] = useState([])
  useEffect(() => {
    const formattedColleges = institutions.map(college => ({
      value: college.name,
      label: college.name
    }));
    setCollegeList(formattedColleges);
  }, []);
  useEffect(()=>{
    const formattedDegrees = degrees.map( degree =>({
      value: degree.type,
      label: degree.type
    }))
    setDegreesList(formattedDegrees)
  },[])
  useEffect(()=>{
    const formattedMajors = majors.map( major =>({
      value: major.major,
      label: major.major
    }))
    setMajorsList(formattedMajors)
  },[])
  const [personalInfo, setPersonalInfo] = useState({
    firstname:"",
    lastname:"",
    email: "",
    phone: "",
    pronoun: "",
  });

  const [education, setEducation] = useState([
    { institution: "", startDate: "", endDate:"", major: "", minor: "", degree: "", gpa: "" },
  ]);
  const [workExperience, setWorkExperience] = useState([
    { title: "", company: "", startDate: "", endDate:"", description: [""], location: "" },
  ]);
  const [projects, setProjects] = useState([
    { title: "", tools: [""], startDate: "", endDate:"", descriptions: [""] },
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
              : [{ institution: "", startDate: "", endDate:"", present: false, major: "", minor: "", degree: "", gpa: "" }]
          );
          setWorkExperience(
            profile.work && profile.work.length > 0 
              ? profile.work 
              : [{ title: "", company: "", startDate: "", endDate:"", present: false, description: [""], location: "" }]
          );   
          setProjects(
            profile.projects && profile.projects.length > 0
              ? profile.projects 
              : [{ title: "", tools: [""], startDate: "", endDate:"", present: false, descriptions: [""] }]
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
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, '');
      setPersonalInfo({ ...personalInfo, [name]: numericValue });

    } else {
      setPersonalInfo({ ...personalInfo, [name]: value });
    }
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
  const handleDescChange = (expI, descI, e) => {
    const updated = [...workExperience];
    updated[expI].description[descI] = e.target.value;
    setWorkExperience(updated);
  };
  const handleProChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...projects];
    updated[i][name] = value;
    setProjects(updated);
  };
  const handleToolChange = (proI, toolI, e) => {
    const updated = [...projects];
    updated[proI].tools[toolI] = e.target.value;
    setProjects(updated);
  }

  const handleRespChange = (proI, respI, e) => {
    const updated = [...projects];
    updated[proI].descriptions[respI] = e.target.value;
    setProjects(updated);
  }

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
  const handleEducationPresentChange = (i, e) => {
    const updated = [...education];
    updated[i].present = e.target.checked;
    updated[i].endDate = e.target.checked ? "Present" : "";
    setEducation(updated);
  };
    const handleExperiencePresentChange = (i, e) => {
    const updated = [...workExperience];
    updated[i].present = e.target.checked;
    updated[i].endDate = e.target.checked ? "Present" : "";
    setWorkExperience(updated);
  };
    const handleProjectPresentChange = (i, e) => {
    const updated = [...projects];
    updated[i].present = e.target.checked;
    updated[i].endDate = e.target.checked ? "Present" : "";
    setProjects(updated);
  };


  // Add/remove
  const addEducation = () => {
    const today = new Date().toISOString().split('T')[0];
    setEducation([...education, { institution: "", dates: today, major: "", minor: "", degree: "", gpa: "" }]);
  };
  const removeEducation = (i) => setEducation(education.filter((_, x) => x !== i));
  const addWork = () => {
    const today = new Date().toISOString().split('T')[0];
    setWorkExperience([...workExperience, { title: "", company: "", startDate: "", endDate:"", description: [""], location: "" }]);
  };
  const removeWork = (i) => setWorkExperience(workExperience.filter((_, x) => x !== i));
  const addDescription = (workI) => {
    const updated = [...workExperience];
    updated[workI].description.push("");
    setWorkExperience(updated);
  };
  const removeDescription = (workI, descI) => {
    const updated = [...workExperience];
    updated[workI].description = updated[workI].description.filter((_, i) => i !== descI);
    setWorkExperience(updated);
  };
  const addPro = () => {
    const today = new Date().toISOString().split('T')[0];
    setProjects([...projects, { title: "", tools: [""], startDate: "", endDate:"", descriptions: [""] }]);
  };
  const removePro = (i) => setProjects(projects.filter((_, x) => x !== i));
  const addTool = (proI) => {
    const updated = [...projects];
    updated[proI].tools.push("");
    setProjects(updated);
  };
  const removeTool = (proI, toolI) => {
    const updated = [...projects];
    updated[proI].tools = updated[proI].tools.filter((_, i) => i !== toolI);
    setProjects(updated);
  };
  const addResponsibilities = (proI) => {
    const updated = [...projects];
    updated[proI].descriptions.push("");
    setProjects(updated);
  };
  const removeResponsibilities = (proI, respI) => {
    const updated = [...projects];
    updated[proI].descriptions = updated[proI].descriptions.filter((_, i) => i !== respI);
  setProjects(updated);
  };
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
            project:projects,
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
    <div style={{ backgroundColor: "#F7EBDF", minHeight: "100vh" }}>
  
      {/* Logo only */}
      <img
        src={logo}
        alt="Resumefy Logo"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "25px",
          left: "40px",
          height: "110px",
          cursor: "pointer",
          zIndex: 999,
        }}
      />
    <div className="page-container">
      {/* <button className="back-to-gen">Back</button> */}
      <form onSubmit={handleSubmit} className="form">
      <button 
        onClick={() => navigate("/resumegeneration")}
        className="back-button-inline"
      >
      ← Back
      </button>

        <h1 className="title">Your Profile</h1>
        {/* Personal */}
        <CollapsibleSection title="Personal Info" expandAllTrigger={expandAllTrigger}>
          <div className="input-grid">
            <div className="required">
              <input name="firstname" placeholder="First Name" value={personalInfo.firstname} onChange={handlePersonalChange} className="input input-half" required />
              <span className="asterisk">*</span>
            </div>
            <div className="required">
              <input  name="lastname" placeholder="Last Name" value={personalInfo.lastname} onChange={handlePersonalChange} className="input input-half" required />
              <span className="asterisk">*</span>
            </div>
            <div className="required">
              <input disabled name="email" type="email" placeholder="Email" value={personalInfo.email} onChange={handlePersonalChange} className="input input-half" required />
              <span className="asterisk">*</span>
            </div>
            <div className="required">
              <input maxLength={10} type="number" name="phone" placeholder="Phone (numbers only)" value={personalInfo.phone} onChange={handlePersonalChange} className="input input-half" />
            </div>
          </div>
        </CollapsibleSection>
        {/* Education */}
        <CollapsibleSection title="Education" expandAllTrigger={expandAllTrigger}>
          {education.map((edu, index) => (
            <div key={index} className="work-experience-item">
              <div className="required">
              <Select className="dropdown"
                name="institution"
                placeholder="Search for an institution..."
                options={collegeList} 
                isClearable
                isSearchable
                required
                value={collegeList.find(c => c.value === edu.institution)}
                
                onChange={(selectedOption) => {
                  const value = selectedOption ? selectedOption.value : "";
                  const mockEvent = {
                    target: {
                      name: "institution",
                      value: value
                    }
                  };
                  handleEducationChange(index, mockEvent);
                }}
                
                classNamePrefix="react-select"
              />
              <span className="asterisk">*</span>
              </div>
              <div className="input-grid" required>
                <DatePicker
                  name="startDate"
                  placeholderText="Start Date (MM/YYYY)"
                  selected={edu.startDate ? new Date(edu.startDate.replace(/-/g, '/')) : null}
                  
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "startDate",
                        value: value
                      }
                    };
                    handleEducationChange(index, mockEvent);
                  }}
                  
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  
                  className="input input-half"
                />
                {!edu.present && (
                <DatePicker
                  name="endDate"
                  placeholderText="End Date(MM/YYYY)"
                  selected={edu.endDate ? new Date(edu.endDate.replace(/-/g, '/')) : null}
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "endDate",
                        value: value
                      }
                    };
                    handleEducationChange(index, mockEvent);
                  }}
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  className="input input-half"
                />
              )}
              <label className="present-checkbox">
                <input
                  type="checkbox"
                  checked={edu.present}
                  onChange={(e) => handleEducationPresentChange(index, e)}
                />
                Present
              </label>

                <div className="required">
                <select
                  name="major"
                  value={edu.major}
                  onChange={(e) => handleEducationChange(index, e)}
                  className="input input-half"
                  required
                >
                  <option value="">Select a Major</option>
                  {majorsList.map((major)=>(
                    <option key={major.value} value={major.value}>
                      {major.label}
                    </option>
                  ))}
                </select>
                <span className="asterisk">*</span>
                </div>
                <div className="required">
                <select
                  name="minor"
                  value={edu.minor}
                  onChange={(e) => handleEducationChange(index, e)}
                  className="input input-half"
                  required
                >
                  <option value="">Select a Minor</option>
                  {majorsList.map((minor)=>(
                    <option key={minor.value} value={minor.value}>
                      {minor.label}
                    </option>
                  ))}
                </select>
                <span className="asterisk">*</span>
                </div>
                <div className="required">
                <select
                  name="degree"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, e)}
                  className="input input-half"
                  required
                >
                  <option value="">Select a Degree</option>
                  {degreesList.map((degree) => (
                    <option key={degree.value} value={degree.value}>
                      {degree.label}
                    </option>
                  ))}
                </select>
                <span className="asterisk">*</span>
                </div>
              </div>
              {/* <input type="number" name="gpa" placeholder="GPA" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} className="input input-half" /> */}
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
               <DatePicker
                  name="startDate"
                  placeholderText="Start Date(MM/YYYY)"
                  
                  selected={exp.startDate ? new Date(exp.startDate.replace(/-/g, '/')) : null}
                  
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "startDate",
                        value: value
                      }
                    };
                    handleWorkChange(index, mockEvent);
                  }}
                  
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  
                  className="input input-half"
                />
              {!exp.present && (
                <DatePicker
                  name="endDate"
                  placeholderText="End Date(MM/YYYY)"
                  selected={exp.endDate ? new Date(exp.endDate.replace(/-/g, '/')) : null}
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "endDate",
                        value: value
                      }
                    };
                    handleWorkChange(index, mockEvent);
                  }}
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  className="input input-half"
                />
              )}
              <label className="present-checkbox">
                <input
                  type="checkbox"
                  checked={exp.present}
                  onChange={(e) => handleExperiencePresentChange(index, e)}
                />
                Present
              </label>
              {exp.description.map((desc, descI) => (
              <div key={descI} className="list-item-container">
                <input placeholder="Description" value={desc} onChange={(e) => handleDescChange(index, descI, e)} className="input input-flex"/>
                <button type="button" onClick={() => removeDescription(index, descI)} className="remove-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addDescription(index)} className="add-button">Add Descrptions</button>
              <input name="location" placeholder="Location" value={exp.location} onChange={(e) => handleWorkChange(index, e)} className="input" />
              <button type="button" onClick={() => removeWork(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWork} className="add-button">Add Work Experience</button>
        </CollapsibleSection>
        {/* Projects */}
        {/* !!! */}
        <CollapsibleSection title="Projects" expandAllTrigger={expandAllTrigger}>
          {projects.map((pro, index) => (
            <div key={index} className="work-experience-item">
            <input name="title" placeholder="Project Title" value={pro.title} onChange={(e) => handleProChange(index, e)} className="input" required />
            {pro.tools.map((tool, toolI) => (
              <div key={toolI} className="list-item-container">
                <input placeholder="Tools" value={tool} onChange={(e) => handleToolChange(index, toolI, e)} className="input input-flex"/>
                <button type="button" onClick={() => removeTool(index, toolI)} className="remove-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addTool(index)} className="add-button">Add Tool</button>
            <DatePicker
              name="startDate"
              placeholderText="Start Date(MM/YYYY)"
                  
                  selected={pro.startDate ? new Date(pro.startDate.replace(/-/g, '/')) : null}
                  
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "startDate",
                        value: value
                      }
                    };
                    handleProChange(index, mockEvent);
                  }}
                  
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  
                  className="input input-half"
                />
              {!pro.present && (
                <DatePicker
                  name="endDate"
                  placeholderText="End Date(MM/YYYY)"
                  selected={pro.endDate ? new Date(pro.endDate.replace(/-/g, '/')) : null}
                  onChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : "";
                    const mockEvent = {
                      target: {
                        name: "endDate",
                        value: value
                      }
                    };
                    handleProChange(index, mockEvent);
                  }}
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  maxDate={new Date()}
                  className="input input-half"
                />
              )}
              <label className="present-checkbox">
                <input
                  type="checkbox"
                  checked={pro.present}
                  onChange={(e) => handleProjectPresentChange(index, e)}
                />
                Present
              </label>
            {pro.descriptions.map((resp, respI) => (
              <div key={respI} className="list-item-container">
                <input placeholder="Responsibilities" value={resp} onChange={(e) => handleRespChange(index, respI, e)} className="input input-flex"/>
                <button type="button" onClick={() => removeResponsibilities(index, respI)} className="remove-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addResponsibilities(index)} className="add-button">Add Responsibilities</button>
            <button type="button" onClick={() => removePro(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addPro} className="add-button">Add Project</button>
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

        <button type="submit" className="submit-button">Submit Profile</button>
      </form>
    </div>
    </div>
  );
};

export default ProfileCreationPage;