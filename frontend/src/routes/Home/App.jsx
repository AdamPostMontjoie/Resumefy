import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Home Page</h1>
      <button onClick={goToLogin}>Login Page</button>
    </div>
  );
}

export default App;
