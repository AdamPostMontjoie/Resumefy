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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
          <div><h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Resumefy</h1></div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={handleLogout} style={{ padding: '10px 24px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '1rem' }}>Logout</button>
          <div onClick={editProfile} style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #372414, #372414)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '2.1rem' }}>🧛🏻‍♂️</div>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Create Your Resume</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>Paste the job description below</p>

        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '600' }}>Job Description</div>
            <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste job description here..." style={{ width: '100%', minHeight: '500px', border: 'none', padding: '24px', fontSize: '1.2rem', resize: 'vertical' }} />
          </div>

          <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '600' }}>Quick Actions</h3>
              <button onClick={editProfile} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', marginBottom: '12px', cursor: 'pointer' }}>📝 Edit Profile</button>
              <button onClick={handleGenerate} style={{ ...buttonStyle, padding: '16px' }}>Generate Resume</button>
            </div>
            <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '20px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💡</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1e40af' }}>Pro Tip</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>Include specific skills from the job description!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeGenerationPage