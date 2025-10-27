import React from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F7EBDF 0%, #EEEEF0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        color: "#372414",
        padding: "40px 20px",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          position: "absolute",
          top: "20px",
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "'Playfair Display', serif",
            margin: 0,
          }}
        >
          RESUMEFY
        </h1>
        <nav style={{ display: "flex", gap: "25px" }}>
          <a href="#" style={navLink}>
            Home
          </a>
          <a href="#" style={navLink}>
            About
          </a>
          <a href="#" style={navLink}>
            Features
          </a>
          <a href="#" style={navLink}>
            Contact
          </a>
          <button onClick={goToLogin} style={loginButton}>
            Sign In
          </button>
        </nav>
      </header>

      <section
        style={{
          textAlign: "center",
          maxWidth: "800px",
          marginTop: "120px",
        }}
      >
        <h2
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            marginBottom: "20px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Build Professional Resumes Tailored for Success
        </h2>
        <p
          style={{
            fontSize: "1.25rem",
            lineHeight: "1.8",
            maxWidth: "650px",
            margin: "0 auto 40px",
            color: "#4a3b31",
          }}
        >
          At <strong>Resumefy</strong>, we combine design and intelligence to
          help you craft resumes that stand out. Whether you're a student,
          professional, or career changer, we tailor your experience to match
          your dream job.
        </p>
        <button onClick={goToLogin} style={ctaButton}>
          Get Started
        </button>
      </section>

      <section
        style={{
          marginTop: "100px",
          textAlign: "center",
          maxWidth: "1100px",
        }}
      >
        <h3
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            marginBottom: "50px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Our Core Values
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          {[
            {
              title: "Personalization",
              text: "Each resume is built around your unique skills, experiences, and career goals.",
            },
            {
              title: "Professionalism",
              text: "Our templates and tone align with industry standards and recruiter preferences.",
            },
            {
              title: "Efficiency",
              text: "Create a complete, polished resume in minutes using our streamlined design.",
            },
          ].map((card, i) => (
            <div key={i} style={cardStyle}>
              <h4 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                {card.title}
              </h4>
              <p style={{ fontSize: "1rem", color: "#4a3b31", marginTop: "10px" }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
  style={{
    marginTop: "120px",
    textAlign: "center",
    maxWidth: "1100px",
  }}
>
  <h3
    style={{
      fontSize: "2.2rem",
      fontWeight: "700",
      marginBottom: "50px",
      fontFamily: "'Playfair Display', serif",
    }}
  >
    What Our Users Say
  </h3>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "30px",
    }}
  >
    {[
      {
        name: "Samantha Lee",
        role: "Marketing Graduate",
        text: "Resumefy made applying for jobs so much easier. My resume finally looks professional and modern!",
      },
      {
        name: "Ishaan Patel",
        role: "Software Engineer",
        text: "I love how quick and personalized it was. My resume quality is at its best as well.",
      },
      {
        name: "Alicia Gomez", 
        role: "Product Manager",
        text: "Within a week of using Resumefy, I landed three interviews. It's honestly a game-changer.",
      },
    ].map((review, i) => (
      <div
        key={i}
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "35px 30px",
          width: "320px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "left",
          transition: "transform 0.2s",
        }}
      >
        <p
          style={{
            fontSize: "1.05rem",
            color: "#4a3b31",
            lineHeight: "1.6",
            marginBottom: "20px",
          }}
        >
          “{review.text}”
        </p>
        <div>
          <strong style={{ fontSize: "1.1rem" }}>{review.name}</strong>
          <p style={{ margin: "4px 0", color: "#7b6b5b", fontSize: "0.95rem" }}>
            {review.role}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>


      <footer
        style={{
          marginTop: "120px",
          color: "#5e4a3a",
          fontSize: "0.95rem",
        }}
      >
        © 2025 Team 4 Inc. | Crafted with ❤️ at UMass Amherst
      </footer>
    </div>
  );
}
const navLink = {
  textDecoration: "none",
  color: "#372414",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "color 0.2s",
};

const loginButton = {
  backgroundColor: "#372414",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "10px 18px",
  fontWeight: "600",
  cursor: "pointer",
};

const ctaButton = {
  background: "linear-gradient(135deg, #372414 0%, #372414 100%)",
  color: "white",
  fontSize: "1.2rem",
  fontWeight: "600",
  border: "none",
  borderRadius: "12px",
  padding: "16px 30px",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(55, 36, 20, 0.3)",
  transition: "transform 0.2s",
};

const cardStyle = {
  background: "white",
  borderRadius: "18px",
  padding: "30px",
  width: "300px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
};

export default App;
