import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

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

function LoginPage({ onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !confirmPassword)) return setError('Please fill all fields');
    if (isSignUp && password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    setError('');
    try {
      const cred = isSignUp 
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
        if (onSuccess) onSuccess(cred.user);
        navigate("/profile");


    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already in use' : 
               err.code === 'auth/invalid-email' ? 'Invalid email' :
               err.code === 'auth/weak-password' ? 'Password too weak' : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F7EBDF 0%, #EEEEF0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`@keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); }}`}</style>
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)', borderRadius: '50%', top: '10%', left: '10%', animation: 'float 20s infinite' }} />
      
      <div style={{ display: 'flex', gap: '80px', maxWidth: '1200px', alignItems: 'center', zIndex: 1 }}>
        <div style={{ flex: 1, color: 'black' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '800', margin: 0 }}>RESUMEFY</h1>
          <p style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.2em', margin: '15px 0' }}>BY TEAM 4 INC.</p>
          <p style={{ fontSize: '1.25rem', margin: '30px 0' }}>Create professional resumes tailored to any job description.</p>
          <div style={{ display: 'flex', gap: '30px' }}>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '50px 45px', boxShadow: '0 50px 100px rgba(0,0,0,0.3)', width: '450px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0 0 8px 0' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ color: '#372414', marginBottom: '35px' }}>{isSignUp ? 'Sign up to start building' : 'Sign in to continue'}</p>

          {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '24px', color: '#991b1b' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            )}
            <button onClick={handleAuth} disabled={loading} style={buttonStyle}>{loading ? '...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
            <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '1rem', color: '#372414' }}>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</div>
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setEmail(''); setPassword(''); setConfirmPassword(''); }} style={{ ...buttonStyle, background: 'white', color: '#372414', border: '2px solid #372414' }}>{isSignUp ? 'Sign In Instead' : 'Create Account'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
