import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import timsoftLogo from '../assets/timsoft.png';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Opinion state
  const [opinion, setOpinion] = useState('');
  const [opinionStatus, setOpinionStatus] = useState('');
  const [userOpinions, setUserOpinions] = useState<string[]>([]);
  const [isOpinionFormOpen, setIsOpinionFormOpen] = useState(false);

  // Fetch user opinions from backend on mount and after submit
  React.useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/opinion", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.opinions)) {
          setUserOpinions(data.opinions);
        }
      } catch {
        // Ignore fetch errors for opinions
      }
    };
    fetchOpinions();
  }, []);

  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpinionStatus('');
    // Get user from localStorage and send email with opinion
    const userStr = localStorage.getItem("user");
    let userEmail = "";
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch {
        userEmail = "";
      }
    }
    if (!userEmail) {
      setOpinionStatus("Please sign in before submitting your opinion.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opinion, user: userEmail }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOpinionStatus("Thank you for your feedback!");
        setOpinion('');
        // Refresh opinions after submit
        const resp = await fetch("http://localhost:3000/api/opinion", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const opinionsData = await resp.json();
        if (resp.ok && Array.isArray(opinionsData.opinions)) {
          setUserOpinions(opinionsData.opinions);
        }
      } else {
        setOpinionStatus(data.message || "Failed to submit opinion.");
      }
    } catch {
      setOpinionStatus("Server error. Please try again.");
    }
  };

  return (
    <div className="landing-container">
      {/* Header / Nav */}
      <header className="landing-header">
        <div className="logo">
          <img src={timsoftLogo} alt="BrainBot by Timsoft" />
          <span>BrainBot</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <button onClick={() => navigate('/login')}>Sign In</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-text">
          <h1>Welcome to BrainBot</h1>
          <p>Your AI‑powered ERP assistant: get instant answers from your documents.</p>
          {/* Remove direct navigation to chatbot, only allow login */}
          <button onClick={() => navigate('/login')}>Sign In to Start Chatting</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <h2>Why BrainBot?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Instant Retrieval</h3>
            <p>Upload any ERP file and receive instant, context‑aware answers.</p>
          </div>
          <div className="feature-card">
            <h3>OCR & NLP</h3>
            <p>Scanned PDFs, images, and videos—BrainBot reads them all.</p>
          </div>
          <div className="feature-card">
            <h3>Secure & Local</h3>
            <p>Runs locally for maximum data privacy and performance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="landing-testimonials">
        <h2>What Users Are Saying</h2>
        <div className="testimonials-grid">
          {/* Show submitted opinions from backend */}
          {userOpinions.length > 0 ? (
            userOpinions.map((op, idx) => (
              <blockquote key={idx}>
                “{op}”
                <footer>— BrainBot User</footer>
              </blockquote>
            ))
          ) : (
            <>
              <blockquote>
                “Saved our team hours every week—BrainBot is a game changer.”
                <footer>— Alex Martinez, ERP Lead</footer>
              </blockquote>
              <blockquote>
                “Handles complex queries with ease. Highly recommended!”
                <footer>— Jasmine Patel, Operations Manager</footer>
              </blockquote>
              <blockquote>
                “The perfect assistant for busy professionals.”
                <footer>— Liam O’Connor, IT Director</footer>
              </blockquote>
            </>
          )}
        </div>
        {/* Opinion Section - more esthetic */}
        <div
          style={{
            marginTop: "3rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#e9ecef 0%,#f7fafc 100%)",
              borderRadius: "18px",
              boxShadow: "0 4px 24px rgba(60,72,88,0.10)",
              padding: "2rem 2.5rem",
              maxWidth: 420,
              width: "100%",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3 style={{
              textAlign: "center",
              marginBottom: "1.2rem",
              color: "#4c51bf",
              fontWeight: 700,
              fontSize: "1.35rem",
              letterSpacing: "0.02em"
            }}>
              💬 Share Your Opinion
            </h3>
            {!localStorage.getItem("user") ? (
              <div style={{ textAlign: "center", color: "#e53e3e", marginBottom: "1rem" }}>
                Please{" "}
                <button
                  style={{
                    color: "#4c51bf",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                  onClick={() => {
                    // Set flag so login redirects to home for opinion
                    localStorage.setItem("opinionSignIn", "true");
                    navigate('/login');
                  }}
                >
                  sign in
                </button>{" "}
                to submit your opinion.
              </div>
            ) : (
              <form
                onSubmit={handleOpinionSubmit}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                <textarea
                  value={opinion}
                  onChange={e => setOpinion(e.target.value)}
                  placeholder="We value your feedback! Write your thoughts here..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #a0aec0",
                    fontSize: "1.05rem",
                    resize: "vertical",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={!opinion}
                  style={{
                    background: "linear-gradient(90deg,#667eea,#5a67d8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.85rem",
                    fontWeight: 600,
                    fontSize: "1.08rem",
                    cursor: opinion ? "pointer" : "not-allowed",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    transition: "background 0.2s",
                    marginTop: "0.5rem"
                  }}
                >
                  Submit Opinion
                </button>
              </form>
            )}
            {opinionStatus && (
              <div
                style={{
                  marginTop: "1rem",
                  textAlign: "center",
                  color: opinionStatus.startsWith("Thank") ? "#38a169" : "#e53e3e",
                  fontWeight: 500,
                  fontSize: "1rem",
                  letterSpacing: "0.01em"
                }}
              >
                {opinionStatus}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 BrainBot by Timsoft. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

