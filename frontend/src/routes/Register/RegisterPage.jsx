import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../../auth/auth";
import axios from "axios";
import { useAuth } from "../../auth/useAuth";
import "./Register.css"

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const navigate = useNavigate();
  const {userLoggedIn} = useAuth()

  //direct out if already logged in
  useEffect(()=>{
        function checkAuth(){
          if(userLoggedIn && !loading){
            navigate('/resumegeneration')
          }
        }
        checkAuth()
    },[userLoggedIn,navigate,loading])

  //creates user in firebase auth
  const handleRegister = async () => {
    let navigated = false;
        setLoading(true);
        setError('');
        try {
            let cred = await doCreateUserWithEmailAndPassword(email,password)
            console.log(cred.user)
            createUserObject(cred)
            navigated = true;
            navigate("/profile");
        } catch (err) {
          setError(err.code === 'auth/invalid-email' ? 'This email is not valid' : 
                   err.code === 'auth/email-already-exists' ? 'Email already in use' :
                   err.code === 'auth/weak-password' ? 'Password too weak' : 'Authentication failed');
        } finally {
          if (!navigated) { 
            setLoading(false);
          }
        }
  };

  //creates user document in database
  const createUserObject = async (cred) => {
    try {
      const body = {
        id: cred.user.uid,
        email: cred.user.email
      }
      const result = await axios.post('http://localhost:5005/register',body)
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
    {/* Logo added here */}
    <img
      src={logo}
      alt="Resumefy Logo"
      onClick={() => navigate("/")}
      style={{
        position: "absolute",
        top: "20px",
        left: "40px",
        height: "110px",
        cursor: "pointer",
        zIndex: 999,
      }}
    />
   <div className="login-page-container">
      <div className="background-shape" />
      
      <div className="content-wrapper">
    

      <div className="form-card">
        {/* Back Button inside card */}
        <button
          onClick={() => navigate('/login')}
          className="back-button"
          style={{
            alignSelf: "flex-start",
            marginBottom: "15px",
            padding: "8px 15px",
            borderRadius: "10px",
            border: "2px solid #372414",
            background: "white",
            cursor: "pointer",
            fontWeight: "600",
            color: "#372414",
          }}
        >
          ← Back
        </button>


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
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="input-style" />
            </div>
            <button onClick={handleRegister} disabled={loading} className="button-style">{loading ? '...' : ( 'Sign Up')}</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default RegisterPage;
