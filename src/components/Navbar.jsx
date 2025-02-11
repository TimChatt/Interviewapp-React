import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <nav className="navbar">
      {/* Sidebar Logo */}
      <div className="navbar-logo">
        <Link to="/">Interview Analysis</Link>
      </div>

      {/* Sidebar Menu */}
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link to="/">Home</Link>
        </li>

        {/* Candidate Dropdown */}
        <li className={`navbar-item dropdown ${openDropdown === "candidate" ? "open" : ""}`} onClick={() => toggleDropdown("candidate")}>
          Candidate
          <ul className="dropdown-menu">
            <li><Link to="/candidate/search">Search</Link></li>
            <li><Link to="/candidate/profile">Profile</Link></li>
          </ul>
        </li>

        {/* Insights Dropdown */}
        <li className={`navbar-item dropdown ${openDropdown === "insights" ? "open" : ""}`} onClick={() => toggleDropdown("insights")}>
          Insights
          <ul className="dropdown-menu">
            <li><<Link to="/insights/trends">Trends & Patterns</Link></li>
            <li><Link to="/insights/ai">AI vs Actual Scores</Link></li>
          </ul>
        </li>

        {/* Admin Dropdown */}
        <li className={`navbar-item dropdown ${openDropdown === "admin" ? "open" : ""}`} onClick={() => toggleDropdown("admin")}>
          Admin
          <ul className="dropdown-menu">
            <li><Link to="/admin/settings">Settings</Link></li>
            <li><Link to="/admin/security">Security</Link></li>
          </ul>
        </li>

        <li className="navbar-item">
          <Link to="/reporting">Reporting</Link>
        </li>
        <li className="navbar-item">
          <Link to="/recommendations">Recommendations</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
