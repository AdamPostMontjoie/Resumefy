import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/register");
  };

  const backToHome = () => {
    navigate("/");
  };

  const handleLogin = () => {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (username === savedUsername && password === savedPassword) {
      alert("Login successful!");
      navigate("/profile"); // redirect to profile page
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Top-left button */}
      <button
        onClick={backToHome}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          fontSize: "16px"
        }}
      >
        Back to Home
      </button>

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button
          onClick={handleLogin}
          style={{ padding: "10px 20px", fontSize: "16px", marginBottom: "20px" }}
        >
          Login
        </button>
        <p>Don't have an account yet?</p>
        <button
          onClick={goToRegister}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginPage
