import React, { useState, useEffect} from "react";
import { doSignInWithEmailAndPassword } from "../../auth/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Login.css";

function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {userLoggedIn} = useAuth()

  useEffect(()=>{
    function checkAuth(){
      if(userLoggedIn){
        navigate('/resumegeneration')
      }
    }
    checkAuth()
  },[userLoggedIn,navigate])
  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
        let cred = await doSignInWithEmailAndPassword(email,password)
        if (onSuccess) onSuccess(cred.user);
        navigate("/resumegeneration");
    } catch (err) {
      setError(err.code === 'invalid-email' ? 'This email is not registered' : 
               err.code === 'auth/invalid-email' ? 'Invalid email' :
               err.code === 'auth/weak-password' ? 'Password too weak' : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-page-container">
      <div className="background-shape" />
      
      <div className="content-wrapper">
        <div className="branding-section">
          <h1 className="branding-title">RESUMEFY</h1>
          <p className="branding-subtitle">BY TEAM 4 INC.</p>
          <p className="branding-description">Create professional resumes tailored to any job description.</p>
          <div className="empty-flex-div">
          </div>
        </div>

        <div className="form-card">


          {error && <div className="error-message">{error}</div>}

          <div className="form-fields-container">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-style" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-style" />
            </div>
            <button onClick={handleAuth} disabled={loading} className="button-style">{loading ? '...' : ( 'Sign In')}</button>
            <div className="separator-text">{"Don't have an account?"}</div>
            <button onClick={() => { navigate('/register')}} className="register-button">{"Register for Resumefy"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;