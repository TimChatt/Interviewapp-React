import React from "react";
import { Link } from "react-router-dom";
import "./NavigationBar.css"; // Ensure the CSS file is linked

const NavigationBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section (Optional, Remove If Not Needed) */}
        <div className="navbar-logo">Hawk-Eye</div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Logout Button */}
        <button className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default NavigationBar;
