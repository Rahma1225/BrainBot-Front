import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import teamsoftLogo from "../assets/timsoft.png"; // Same logo as FileUpload

const ChatbotEvaluation: React.FC = () => {
  const [chartUrl, setChartUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChart();
  }, []);

  const fetchChart = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/evaluations/ragas");
      if (!res.ok) throw new Error("Failed to fetch evaluation chart");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setChartUrl(url);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch evaluation chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={teamsoftLogo} alt="Teamsoft Logo" className="logo" />
        </div>
        <div className="nav-links">
          <Link to="/admin" className="dashboard-btn">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Evaluation chart section */}
      <div className="upload-page">
        <div className="upload-container" style={{ flexDirection: "column" }}>
          <h1>Chatbot Evaluations</h1>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && chartUrl && (
            <img src={chartUrl} alt="Evaluation Chart" style={{ maxWidth: "100%", marginTop: "20px" }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotEvaluation;
