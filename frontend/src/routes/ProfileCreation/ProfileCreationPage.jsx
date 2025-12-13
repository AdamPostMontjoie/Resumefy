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
  const [collegeList, setCollegeList] = useState([])
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
    linkedin: "",
    github: ""
  });

  const [education, setEducation] = useState([
    { institution: "", startDate: "", endDate:"", major: "", minor: "", degree: "", location: "" },
  ]);
  const [workExperience, setWorkExperience] = useState([
    { title: "", company: "", startDate: "", endDate:"", description: [""], location: "" },
  ]);
  const [projects, setProjects] = useState([
    { title: "", tools: [""], startDate: "", endDate:"", descriptions: [""] },
  ]);
  const [skills, setSkills] = useState([""]);

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
          setPersonalInfo({
            ...(profile.personal || {}),
            email: email
          });
          setEducation(
            profile.education && profile.education.length > 0
              ? profile.education
              : [{ institution: "", startDate: "", endDate:"", major: "", minor: "", degree: "", location: ""}]
          );
          setWorkExperience(
            profile.work && profile.work.length > 0
              ? profile.work
              : [{ title: "", company: "", startDate: "", endDate:"", description: [""], location: "" }]
          );
          setProjects(
            profile.projects && profile.projects.length > 0
              ? profile.projects
              : [{ title: "", tools: [""], startDate: "", endDate:"", descriptions: [""] }]
          );
          setSkills(
            profile.skills && profile.skills.length > 0
              ? profile.skills
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
      setPersonalInfo(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setPersonalInfo(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleEducationChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...education];
    updated[i] = { ...updated[i], [name]: value };
    setEducation(updated);
  };
  const handleWorkChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...workExperience];
    updated[i] = { ...updated[i], [name]: value };
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
    updated[i] = { ...updated[i], [name]: value };
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

  // Add/remove
  const addEducation = () => {
    setEducation([
      ...education,
      { institution: "", startDate: "", endDate: "", major: "", minor: "", degree: "", location: "" }
    ]);
  };
  const removeEducation = (i) => setEducation(education.filter((_, x) => x !== i));
  const addWork = () => {
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
              linkedin:personalInfo.linkedin,
              github:personalInfo.github
            },
            work:workExperience,
            projects:projects,
            education:education,
            skills:skills,
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
              <input disabled name="email" type="email" placeholder="Email" value={personalInfo.email} className="input input-half" required />
              <span className="asterisk">*</span>
            </div>
            <div className="required">
              <input maxLength={10} type="number" name="phone" placeholder="Phone (numbers only)" value={personalInfo.phone} onChange={handlePersonalChange} className="input input-half" />
            </div>
            <div className="required">
              <input  name="linkedin" placeholder="linkedin" value={personalInfo.linkedin} onChange={handlePersonalChange} className="input input-half"/>
            </div>
            <div className="required">
              <input  name="github" placeholder="github" value={personalInfo.github} onChange={handlePersonalChange} className="input input-half"/>
            </div>
          </div>
        </CollapsibleSection>
        {/* Education */}
        <CollapsibleSection title="Education" expandAllTrigger={expandAllTrigger}>
          {education.map((edu, index) => (
            <div key={index} className="work-experience-item">
              <div className="required">
              <Select
                name="institution"
                placeholder="Search for an institution..."
                options={collegeList}
                isClearable
                isSearchable
                value={collegeList.find(c => c.value === edu.institution) || null}
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
                className="dropdown"
              />
              {/* hidden input to satisfy native required validation for react-select */}
              <input type="hidden" required value={edu.institution} name={`institution-${index}`} />
              <span className="asterisk">*</span>
              </div>
              <div className="input-grid">
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
                {! (edu.endDate === "Present") && (
                <DatePicker
                  name="endDate"
                  placeholderText="End Date(MM/YYYY)"
                  selected={
                    edu.endDate && edu.endDate !== "Present"
                      ? new Date(edu.endDate.replace(/-/g, '/'))
                      : null
                  }
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

              {/* Present Checkbox (per-entry) */}
              <label className="present-checkbox">
                <input
                  type="checkbox"
                  checked={edu.endDate === "Present"}
                  onChange={(e) => {
                    const updated = [...education];
                    const checked = e.target.checked;
                    updated[index] = { ...updated[index], endDate: checked ? "Present" : "" };
                    setEducation(updated);
                  }}
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
                >
                  <option value="">Select a Minor</option>
                  {majorsList.map((minor)=>(
                    <option key={minor.value} value={minor.value}>
                      {minor.label}
                    </option>
                  ))}
                </select>
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

                <div className="required">
                  <input  name="location" placeholder="location" value={edu.location} onChange={(e) => handleEducationChange(index, e)} className="input input-half" />
                </div>
              </div>
              <button type="button" onClick={() => removeEducation(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addEducation} className="add-button">Add Education</button>
        </CollapsibleSection>
          {/*Work */}
        <CollapsibleSection title="Work Experience" expandAllTrigger={expandAllTrigger}>
          {workExperience.map((exp, index) => (
            <div key={index} className="work-experience-item">
              <div className="required">
              <input name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleWorkChange(index, e)} className="input" required />
              <span className="asterisk">*</span>
              </div>

              <div className="required">
              <input name="company" placeholder="Company" value={exp.company} onChange={(e) => handleWorkChange(index, e)} className="input" required />
              <span className="asterisk">*</span>
              </div>
               
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
              {! (exp.endDate === "Present") && (
                <DatePicker
                  name="endDate"
                  placeholderText="End Date(MM/YYYY)"
                  selected={
                    exp.endDate && exp.endDate !== "Present"
                      ? new Date(exp.endDate.replace(/-/g, '/'))
                      : null
                  }
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

              {/* Present Checkbox (per-entry) */}
              <label className="present-checkbox">
                <input
                  type="checkbox"
                  checked={exp.endDate === "Present"}
                  onChange={(e) => {
                    const updated = [...workExperience];
                    const checked = e.target.checked;
                    updated[index] = { ...updated[index], endDate: checked ? "Present" : "" };
                    setWorkExperience(updated);
                  }}
                />
                Present
              </label>

              <input name="location" placeholder="Location" value={exp.location} onChange={(e) => handleWorkChange(index, e)} className="input" />

              {exp.description.map((desc, descI) => (
              <div key={descI} className="list-item-container">
                <div className="required" style={{ flex: 1 }}> 
                  <input placeholder="Description" value={desc} onChange={(e) => handleDescChange(index, descI, e)} className="input input-flex" required/>
                  <span className="asterisk">*</span>
                </div>

                <button type="button" onClick={() => removeDescription(index, descI)} className="remove-button">Remove</button>
              </div>
            ))}

            <button type="button" onClick={() => addDescription(index)} className="add-button">Add Description </button>
              <button type="button" onClick={() => removeWork(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addWork} className="add-button">Add Work Experience</button>
        </CollapsibleSection>
        {/* Projects */}
        <CollapsibleSection title="Projects" expandAllTrigger={expandAllTrigger}>
          {projects.map((pro, index) => (
            <div key={index} className="work-experience-item">
              <div className="required">
                <input name="title" placeholder="Project Title" value={pro.title} onChange={(e) => handleProChange(index, e)} className="input" required />
                <span className="asterisk">*</span>
              </div>
            
            {pro.tools.map((tool, toolI) => (
              <div key={toolI} className="list-item-container">
                <div className="required" style={{ flex: 1 }}>
                  <input placeholder="Tools" value={tool} onChange={(e) => handleToolChange(index, toolI, e)} className="input input-flex" required/>
                  <span className="asterisk">*</span>
                </div>
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
                {! (pro.endDate === "Present") && (
                  <DatePicker
                    name="endDate"
                    placeholderText="End Date(MM/YYYY)"
                    selected={
                      pro.endDate && pro.endDate !== "Present"
                        ? new Date(pro.endDate.replace(/-/g, '/'))
                        : null
                    }
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

                {/* Present Checkbox (per-entry) */}
                <label className="present-checkbox">
                  <input
                    type="checkbox"
                    checked={pro.endDate === "Present"}
                    onChange={(e) => {
                      const updated = [...projects];
                      const checked = e.target.checked;
                      updated[index] = { ...updated[index], endDate: checked ? "Present" : "" };
                      setProjects(updated);
                    }}
                  />
                  Present
              </label>
            {pro.descriptions.map((resp, respI) => (
              <div key={respI} className="list-item-container">
                <div className="required" style={{ flex: 1 }}>
                  <input placeholder="Project Description" value={resp} onChange={(e) => handleRespChange(index, respI, e)} className="input input-flex" required/>
                  <span className="asterisk">*</span>
                </div>
                
                <button type="button" onClick={() => removeResponsibilities(index, respI)} className="remove-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addResponsibilities(index)} className="add-button">Add Description</button>
            <button type="button" onClick={() => removePro(index)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addPro} className="add-button">Add Project</button>
        </CollapsibleSection>
          {/* Skills */}
        <CollapsibleSection title="Skills" expandAllTrigger={expandAllTrigger}>
          {skills.map((skill, i) => (
            <div key={i} className="list-item-container">
              <div className="required" style={{ flex: 1 }}>
                <input placeholder="Skill" value={skill} onChange={(e) => handleSkillChange(i, e)} className="input input-flex" required/>
                <span className="asterisk">*</span>
              </div>
              
              <button type="button" onClick={() => removeSkill(i)} className="remove-button">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSkill} className="add-button">Add Skill</button>
        </CollapsibleSection>

        <button type="submit" className="submit-button">Submit Profile</button>
      </form>
    </div>
    </div>
  );
};

export default ProfileCreationPage;
