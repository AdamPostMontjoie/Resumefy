import React, {useRef} from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "./App.css"

function App() {
  const navigate = useNavigate();

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        <img
        src={logo}
        alt="Resumefy Logo"
        style={{
          height: "110px",
          objectFit: "contain",
          cursor: "pointer",
          marginLeft: "-80px",
         }}
         onClick={() => scrollToSection(homeRef)} // makes logo scroll back to top
        />

        <nav style={{ display: "flex", gap: "25px" }}>
          <button onClick={() => scrollToSection(homeRef)} className="navLink">
            Home
          </button>
          <button onClick={() => scrollToSection(aboutRef)} className="navLink">
            About
          </button>
          <button onClick={() => scrollToSection(featuresRef)} className="navLink">
            Features
          </button>
          <button onClick={() => scrollToSection(contactRef)} className="navLink">
            Contact
          </button>
          <button onClick={goToLogin} className="loginButton">
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

      {/* ABOUT SECTION */}
      <section
        ref={aboutRef}
        style={{
          marginTop: "120px", 
          padding: "70px 40px",
          textAlign: "center",
          background: "#fff",
          borderRadius: "18px", 
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)", 
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2
          style={{
            fontSize: "2.3rem",
            fontWeight: "700",
            marginBottom: "20px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          About Us
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            maxWidth: "750px",
            margin: "0 auto",
            color: "#4a3b31",
            lineHeight: "1.8",
          }}
        >
          Resumefy was created by <strong>Team 4 Inc.</strong> to simplify the
          job application process. We empower users to present their experiences
          effectively through clean, professional, and AI-enhanced resume tools.
          Our mission is to bridge the gap between talent and opportunity.
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section
        ref={featuresRef}
        style={{
          padding: "100px 20px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "50px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Key Features
        </h2>

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
              title: "Smart Resume Builder",
              text: "Generate job ready resumes with AI-based content suggestions and formatting.",
            },
            {
              title: "ATS Optimization",
              text: "Ensure your resume passes Applicant Tracking Systems for top visibility.",
            },
            {
              title: "Instant Download",
              text: "Export resumes instantly in PDF or DOCX format with a single click.",
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "30px",
                width: "300px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{f.title}</h3>
              <p style={{ fontSize: "1rem", color: "#4a3b31", marginTop: "10px" }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        ref={contactRef}
        style={{
          padding: "100px 20px",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "20px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Contact Us
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#4a3b31",
            maxWidth: "700px",
            margin: "0 auto 40px",
          }}
        >
          Have questions or feedback? We’d love to hear from you!  
          Send us an email at{" "}
          <a href="mailto:team4inc@resumefy.com" style={{ color: "#372414" }}>
            team4inc@resumefy.com
          </a>{" "}
          or reach out on LinkedIn.
        </p>
        <button onClick={goToLogin} style={ctaButton}>
          Try Resumefy Now
        </button>
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
        text: "Within a week of using Resumefy, I landed three interviews. It's honestly a gamechanger.",
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

/*const navLink = {
  background: "none",
  border: "none",
  textDecoration: "none",
  color: "#372414",
  fontWeight: "500",
  fontSize: "1rem",
  cursor: "pointer",
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
};*/

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
