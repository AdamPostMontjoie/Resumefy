import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useEffect } from "react";
import { doSignOut } from "../../auth/auth";
import "./ResumeGeneration.css"

const buttonStyle = {
  width: '100%',
  padding: '16px',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #372414 0%, #372414 100%)',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s'
};

function ResumeGenerationPage(){
  const {userLoggedIn,loading} = useAuth()
  const [jobDesc, setJobDesc] = useState('');
  const [jobResp, setJobResp] = useState('');
  const navigate = useNavigate();

  //if not logged in, redirect to login page
  useEffect(()=>{
    function loginCheck(){
      if(!userLoggedIn && !loading){
        navigate('/login')
      }
    }
    loginCheck()
  },[userLoggedIn, loading,navigate])

  const handleLogout = () => {
    doSignOut()
    navigate("/login");
  };
  //goes to profile page
  const editProfile = () => {
    navigate("/profile");
  };
  //this handles the resume generation
  const handleGenerate = ()=>{
    console.log("do the logic here")
  }

  return (
    <div>
    <button onClick={() => { navigate('/')}} className="back-to-main">Ex</button>
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="top-right" style={{ display: 'flex', gap: '15px' }}>
          <button onClick={editProfile} style={{ width: '100%', padding: '4px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', marginBottom: '12px', cursor: 'pointer' }}>Edit Profile</button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '4px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', marginBottom: '12px', cursor: 'pointer' }}>Logout</button>
          {/*<div onClick={editProfile} style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #372414, #372414)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '2.1rem' }}>🧛🏻‍♂️</div> 📝 */}
        </div>
      </div>

    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}> Create Your Resume </h2>
        <p style={{ color: '#6b7280', margin: 0 }}> Copy and Paste the job description and job responsibilities below </p>
      </div>

      <div style={{position: 'absolute', left: '54%', transform: 'translateX(-50%)'}}>
        <button onClick={handleGenerate} style={{ padding: '16px', marginBottom: '10px' }} className="loginButton">Generate Resume</button>
        <p style={{ color: '#6b7280', margin: 0 }}> Generated PDF Link: </p>
      </div>

    </div>

    <div style={{ display: 'flex', gap: '30px' }}>
      
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb'}}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '600'}}>Job Description</div>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Copy and Paste job description here..." style={{ resize: "none", width: '92%', minHeight: '250px', border: 'none', padding: '24px', fontSize: '1.2rem'}} />
      </div>
          
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '600'}}>Job Responsibilties</div>
          <textarea value={jobResp} onChange={(e) => setJobResp(e.target.value)} placeholder="Copy and Paste job responsibilties here..." style={{ resize: "none", width: '92%', minHeight: '250px', border: 'none', padding: '24px', fontSize: '1.2rem'}} />
      </div>

    </div>
    </div>
    </div>
  );
}

export default ResumeGenerationPage