import React from "react";
import { Link } from "react-router-dom"; // Use React Router for navigation
import "./Navbar.css"; // Import CSS styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Interview Analysis</Link>
      </div>
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link to="/">Home</Link>
        </li>
        <li className="navbar-item dropdown">
          Candidate
          <ul className="dropdown-menu">
            <li>
              <Link to="/candidate/search">Search</Link>
            </li>
            <li>
              <Link to="/candidate/profile">Profile</Link>
            </li>
          </ul>
        </li>
        <li className="navbar-item dropdown">
          Insights
          <ul className="dropdown-menu">
            <li>
              <Link to="/insights/trends">Trends & Patterns</Link>
            </li>
            <li>
              <Link to="/insights/ai">AI vs Actual Scores</Link>
            </li>
          </ul>
        </li>
        <li className="navbar-item dropdown">
          Admin
          <ul className="dropdown-menu">
            <li>
              <Link to="/admin/settings">Settings</Link>
            </li>
            <li>
              <Link to="/admin/security">Security</Link>
            </li>
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

