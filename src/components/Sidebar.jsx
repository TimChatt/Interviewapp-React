import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
        <li><Link to="/candidate/search" className={location.pathname === "/candidate/search" ? "active" : ""}>Candidate Search</Link></li>
        <li><Link to="/candidate/profile" className={location.pathname === "/candidate/profile" ? "active" : ""}>Candidate Profile</Link></li>
        <li><Link to="/insights" className={location.pathname === "/insights" ? "active" : ""}>Insights</Link></li>
        <li><Link to="/recommendations" className={location.pathname === "/recommendations" ? "active" : ""}>Recommendations</Link></li>

        {/* Collapsible Admin Section */}
        <li className="collapsible-section">
          <button className="collapsible-toggle" onClick={() => setIsAdminOpen(!isAdminOpen)}>
            Admin {isAdminOpen ? "▲" : "▼"}
          </button>
          {isAdminOpen && (
            <div className="collapsible-links">
              <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>Admin</Link>
              <Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active" : ""}>Dashboard</Link>
            </div>
          )}
        </li>

        <li><Link to="/competency-framework-planner" className={location.pathname === "/competency-framework-planner" ? "active" : ""}>Competency Framework</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
