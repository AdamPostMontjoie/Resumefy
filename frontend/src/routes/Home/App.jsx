import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCw-LQbn2j2Py5tYiQbMaY9EWZl-EqazqQ",
  authDomain: "resumefy-8e8fa.firebaseapp.com",
  projectId: "resumefy-8e8fa",
  storageBucket: "resumefy-8e8fa.firebasestorage.app",
  messagingSenderId: "340638164003",
  appId: "1:340638164003:web:c8aea1ae3ceec9a9313d96"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

export default function ResumefyApp() {
  const [page, setPage] = useState('auth');
  const [user, setUser] = useState(null);

  if (page === 'auth') return <AuthPage onSuccess={(u) => { setUser(u); setPage('home'); }} />;
  if (page === 'home') return <HomePage onLogout={() => { auth.signOut(); setUser(null); setPage('auth'); }} onProfile={() => setPage('profile')} />;
  return <ProfilePage user={user} onBack={() => setPage('home')} />;
}

function AuthPage({ onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      onSuccess(cred.user);
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

function HomePage({ onLogout, onProfile }) {
  const [jobDesc, setJobDesc] = useState('');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
          <div><h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Resumefy</h1></div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onLogout} style={{ padding: '10px 24px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '1rem' }}>Logout</button>
          <div onClick={onProfile} style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #372414, #372414)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '2.1rem' }}>🧛🏻‍♂️</div>
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
              <button onClick={onProfile} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', marginBottom: '12px', cursor: 'pointer' }}>📝 Edit Profile</button>
              <button style={{ ...buttonStyle, padding: '16px' }}>✨ Generate Resume</button>
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

function ProfilePage({ user, onBack }) {
  const [form, setForm] = useState({ email: user?.email || '', name: '', password: '', contact: '', education: '', work: '', skills: '' });
  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
          <div><h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Edit Profile</h1><p style={{ margin: 0, color: '#6b7280' }}>Update your information</p></div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { label: 'Email', field: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Password', field: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Contact', field: 'contact', type: 'text', placeholder: 'Phone, LinkedIn' },
              { label: 'Education', field: 'education', type: 'textarea', placeholder: 'Your education...' },
              { label: 'Work Experience', field: 'work', type: 'textarea', placeholder: 'Your experience...' },
              { label: 'Skills', field: 'skills', type: 'textarea', placeholder: 'Your skills...' }
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>{label}</label>
                {type === 'textarea' ? (
                  <textarea value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholder} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                ) : (
                  <input type={type} value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholder} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#372414'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={onBack} style={{ flex: 1, ...buttonStyle }}>💾 Save & Return</button>
              <button onClick={() => setForm({ email: user?.email || '', name: '', password: '', contact: '', education: '', work: '', skills: '' })} style={{ padding: '14px 24px', border: '2px solid #e5e7eb', borderRadius: '12px', background: 'white', cursor: 'pointer' }}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}