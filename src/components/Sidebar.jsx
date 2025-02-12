// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Toggle for Admin section

  const toggleAdminSection = () => {
    setIsAdminOpen((prev) => !prev);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Your Logo</h2>
      </div>
      <nav className="sidebar-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard Overview
        </NavLink>
        <NavLink to="/candidates" className={({ isActive }) => (isActive ? "active" : "")}>
          Candidates
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => (isActive ? "active" : "")}>
          Insights
        </NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => (isActive ? "active" : "")}>
          Recommendations
        </NavLink>

        {/* Collapsible Admin Section */}
        <div className="collapsible-section">
          <button className="collapsible-toggle" onClick={toggleAdminSection}>
            Admin {isAdminOpen ? "▲" : "▼"}
          </button>
          {isAdminOpen && (
            <div className="collapsible-links">
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Admin Panel
              </NavLink>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Admin Dashboard
              </NavLink>
            </div>
          )}
        </div>

        {/* Competency Framework Planner */}
        <NavLink
          to="/competency-framework-planner"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Competency Framework Planner
        </NavLink>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
