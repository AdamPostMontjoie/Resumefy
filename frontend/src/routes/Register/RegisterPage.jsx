import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    // Save credentials in localStorage
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    alert("Registered successfully!");
    navigate("/login");
  };
  const backToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
    {/* Top-left button */}
    <button
      onClick={backToLogin}
      style={{
        position: "absolute",
        top: "10px",
        left: "20px",
        padding: "10px 20px",
        fontSize: "16px"
      }}
    >
      Back to Login
    </button>
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
    </div>
  );
}

export default RegisterPage;
