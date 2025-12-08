import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { doSignOut } from "../../auth/auth";
import "./ResumeGeneration.css";

function ResumeGenerationPage() {
  const { userLoggedIn, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  const [jobDesc, setJobDesc] = useState("");
  const [jobResp, setJobResp] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

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
    if (!jobDesc.trim() || !jobResp.trim()) {
      alert("Please paste a job description and responsibilities.");
      return;
    }

    try {
      setIsGenerating(true);
      setPdfUrl("");
      setShowPdf(false);

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
        alert("Resume generation failed: " + (err.error || response.statusText));
        setIsGenerating(false);
        return;
      }

      const data = await response.json();

      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      } else {
        alert("No PDF returned from the server.");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Error generating resume.");
    } finally {
      setIsGenerating(false);
    }
  };

return (
  <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F7EBDF 0%, #EEEEF0 100%)" }}>

      {/* Logo in top-left */}
      <img
        src={logo}
        alt="Resumefy Logo"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          left: "40px",
          height: "90px",
          cursor: "pointer",
          zIndex: 999,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "25px 40px",
          paddingLeft: "140px",
          borderBottom: "1px solid #000000ff",
          position: "relative",
        }}
>

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
        <p style={{ color: '#6b7280', margin: 0 }}> Copy and Paste the job description and job title below </p>
        <p style={{ color: '#6b7280', margin: 0 }}> Click "Generate Resume" when done </p>
      </div>

        {/* Generate button */}
        <div style={{ position: "absolute", left: "54%", transform: "translateX(-50%)", minHeight: '150px' }}>
          <div style={{textAlign: 'center'}}>
          <button
            onClick={handleGenerate}
            className="loginButton"
            style={{ padding: "16px", marginBottom: "10px" }}
          >
            {isGenerating ? "Generating..." : "Generate Resume"}
          </button>

          {pdfUrl && !showPdf && (
            <div style={{ marginTop: '20px', textAlign: 'left', width: '300px', marginLeft: '150px' }}>
            <button
              onClick={() => setShowPdf(true)}
              style={{
                padding: "10px 18px",
                backgroundColor: "#D6C4A3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              View PDF
            </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Text Areas */}
      <div style={{ display: "flex", gap: "30px", marginLeft: "100px"}}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #e5e7eb",
              border: "1px solid #000000ff",
              backgroundColor: "#f9fafb",
              fontWeight: "600",
            }}
          >
            Job Description
          </div>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description..."
            style={{
              width: "100%",
              minHeight: "250px",
              padding: "24px",
              backgroundColor: "white",
              border: "1px solid #000000ff",
              borderTop: "none",
              fontSize: "1.2rem",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #e5e7eb",
              border: "1px solid #000000ff",
              backgroundColor: "#f9fafb",
              fontWeight: "600",
              width: "46.5%"
            }}
          >
            Job Title
          </div>
          <textarea
            value={jobResp}
            onChange={(e) => setJobResp(e.target.value)}
            maxLength="40"
            placeholder="Paste job title..."
            style={{
              width: "50%",
              minHeight: "30px",
              padding: "24px",
              backgroundColor: "white",
              border: "1px solid #000000ff",
              borderTop: "none",
              fontSize: "1.2rem",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* ⭐ CENTERED PDF VIEWER MODAL ⭐ */}
      {showPdf && pdfUrl && (
        <>
          {/* Background dark overlay */}
          <div
            onClick={() => setShowPdf(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.55)",
              zIndex: 9998,
            }}
          />

          {/* PDF window */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70vw",
              height: "80vh",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 10px 35px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: "#D6C4A3",
                display: "flex",
                justifyContent: "flex-end",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
              }}
            >
              <button
                onClick={() => setShowPdf(false)}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            {/* PDF iframe */}
            <iframe
              src={pdfUrl}
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
              title="Generated Resume"
            ></iframe>
          </div>
        </>
      )}
    </div>
  );
}

export default ResumeGenerationPage;
