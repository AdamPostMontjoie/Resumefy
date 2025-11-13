import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { doSignOut } from "../../auth/auth";
import "./ResumeGeneration.css";

/*const buttonStyle = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #372414 0%, #372414 100%)",
  color: "white",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
  transition: "all 0.3s",
};*/

function ResumeGenerationPage() {
  const { userLoggedIn, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  const [jobDesc, setJobDesc] = useState("");
  const [jobResp, setJobResp] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !userLoggedIn) navigate("/login");
  }, [userLoggedIn, loading, navigate]);

  const handleLogout = () => {
    doSignOut();
    navigate("/login");
  };

  const editProfile = () => {
    navigate("/profile");
  };

  const handleGenerate = async () => {
    if (!jobDesc.trim()) {
      alert("Please paste a job description before generating.");
      return;
    }
    if (!jobResp.trim()) {
      alert("Please paste a job responsibility before generating.");
      return;
    }

    try {
      setIsGenerating(true);
      setPdfUrl("");

      const userId = currentUser?.uid;

      const response = await fetch("http://localhost:5005/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          jobDescription: jobDesc,
          jobResponsibilities: jobResp,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Error from backend:", err);
        alert("Resume generation failed: " + (err.error || response.statusText));
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      console.log("Generated resume data:", data);

      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      } else {
        alert("No PDF returned from the server.");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Error generating resume. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7EBDF' }}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '25px 40px', borderBottom: '1px solid #000000ff'}}>
      <button onClick={() => { navigate('/')}} className="quickOptions">Ex</button>
      <h1 style={{ margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Create Your Resume</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={editProfile} style={{ width: '100%', padding: '4px'}} className="quickOptions">Edit Profile</button>
        <button onClick={handleLogout} style={{ width: '100%', padding: '4px'}} className="quickOptions">Logout</button>
      </div>
    </div>
    {/* Saved vampire button and edit icon below*/}
    {/*<div onClick={editProfile} style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #372414, #372414)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '2.1rem' }}>🧛🏻‍♂️</div> 📝 */}

    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}> Instructions </h2>
        <p style={{ color: '#6b7280', margin: 0 }}> Copy and Paste the job description and job responsibilities below </p>
        <p style={{ color: '#6b7280', margin: 0 }}> Click "Generate Resume" when done </p>
      </div>

      <div style={{position: 'absolute', left: '54%', transform: 'translateX(-50%)'}}>
        <button onClick={handleGenerate} style={{ padding: '16px', marginBottom: '10px' }} className="loginButton" disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Generate Resume'>Generate Resume</button>
        {pdfUrl && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>✅ Resume Generated!</p>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline', wordBreak: 'break-all' }}>{pdfUrl}</a>
                </div>
              )}
      </div>

    <div style={{ display: 'flex', gap: '30px' }}>
      
      <div style={{ flex: 1}}>
        <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', borderLeft: '1px solid #000000ff', borderRight: '1px solid #000000ff', borderTop: '1px solid #000000ff', backgroundColor: '#f9fafb', fontWeight: '600'}}>Job Description</div>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Copy and Paste job description here..." style={{ resize: "none", width: '100%', minHeight: '250px', backgroundColor: 'white', borderRadius: '2px', borderLeft: '1px solid #000000ff', borderRight: '1px solid #000000ff', borderBottom: '1px solid #000000ff', borderTop: 'none', boxSizing: 'border-box', padding: '24px', fontSize: '1.2rem'}} />
      </div>
          
      <div style={{ flex: 1}}>
        <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', borderLeft: '1px solid #000000ff', borderRight: '1px solid #000000ff', borderTop: '1px solid #000000ff', backgroundColor: '#f9fafb', fontWeight: '600'}}>Job Responsibilties</div>
          <textarea value={jobResp} onChange={(e) => setJobResp(e.target.value)} placeholder="Copy and Paste job responsibilties here..." style={{ resize: "none", width: '100%', minHeight: '250px', backgroundColor: 'white', borderRadius: '2px', borderLeft: '1px solid #000000ff', borderRight: '1px solid #000000ff', borderBottom: '1px solid #000000ff', borderTop: 'none', boxSizing: 'border-box', padding: '24px', fontSize: '1.2rem'}} />
      </div>

    </div>
    </div>
  </div>
);
}
export default ResumeGenerationPage