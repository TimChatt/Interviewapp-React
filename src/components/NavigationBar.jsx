// src/components/NavigationBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = () => {
  return (
    <div className="navbar">
      <div className="navbar-container">
        {/* Optionally, you can add or update your logo here */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Dashboard Overview
          </Link>
          <Link to="/candidates" className="nav-link">
            Candidates
          </Link>
          <Link to="/insights" className="nav-link">
            Insights
          </Link>
          <Link to="/recommendations" className="nav-link">
            Recommendations
          </Link>
          <Link to="/interviewer-playbook" className="nav-link">
            Interviewer Playbook
          </Link>
          <Link to="/admin" className="nav-link">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;


