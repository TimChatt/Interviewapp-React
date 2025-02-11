// src/components/NavigationBar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./NavigationBar.css";

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
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
          <Link to="/admin" className="nav-link">
            Admin
          </Link>
          <Link to="/admin-dashboard" className="nav-link">
            Admin Dashboard
          </Link>
          {/* New link for Competency Framework Planner */}
          <Link to="/competency-planner" className="nav-link">
            Competency Planner
          </Link>
        </div>
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
