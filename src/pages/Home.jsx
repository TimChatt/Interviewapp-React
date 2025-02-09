// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import ashbyMockData from "../mockdata/ashbyMockData.json";

/**
 * A simple Home page (dashboard overview).
 * 
 * Features:
 * - Welcome header
 * - Quick overview stats (total candidates, hired, archived)
 * - Navigation cards linking to other parts of the app
 */
function Home() {
  const navigate = useNavigate();

  // 1) Basic stats from Ashby data
  const [total, setTotal] = useState(0);
  const [hired, setHired] = useState(0);
  const [archived, setArchived] = useState(0);

  useEffect(() => {
    const totalCandidates = ashbyMockData.length;
    const hiredCandidates = ashbyMockData.filter((c) => c.status === "Hired").length;
    const archivedCandidates = ashbyMockData.filter((c) => c.status === "Archived").length;

    setTotal(totalCandidates);
    setHired(hiredCandidates);
    setArchived(archivedCandidates);
  }, []);

  return (
    <div className="home-page">
      <h1>Welcome to the Interview Analysis App</h1>
      <p className="home-intro">
        This platform combines data from Ashby and Metaview to help you track, review, and improve
        your interviewing process. Dive into the sections below to explore candidate management,
        insights, and personalized recommendations.
      </p>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total Candidates</h2>
          <p>{total}</p>
        </div>
        <div className="stat-card">
          <h2>Hired</h2>
          <p>{hired}</p>
        </div>
        <div className="stat-card">
          <h2>Archived</h2>
          <p>{archived}</p>
        </div>
      </div>

      {/* Navigation Cards / Links */}
      <div className="links-grid">
        <div className="link-card" onClick={() => navigate("/candidates")}>
          <h3>Candidates</h3>
          <p>Manage candidate data and view detailed profiles.</p>
        </div>
        <div className="link-card" onClick={() => navigate("/insights")}>
          <h3>Insights</h3>
          <p>Visualize hiring metrics, interview trends, and more.</p>
        </div>
        <div className="link-card" onClick={() => navigate("/recommendations")}>
          <h3>Recommendations</h3>
          <p>Get actionable suggestions to improve the hiring process.</p>
        </div>
        <div className="link-card" onClick={() => navigate("/admin")}>
          <h3>Admin</h3>
          <p>Manage system settings, permissions, and advanced tasks.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

