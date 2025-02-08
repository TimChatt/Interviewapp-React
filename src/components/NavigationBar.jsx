import React from "react";
import { Link } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Dashboard</Link>
        <div className="navbar-links">
          <Link to="/candidate">Candidate</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/recommendations">Recommendations</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
