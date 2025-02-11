import React from "react";
import { Link } from "react-router-dom";
import "./NavigationBar.css"; // Ensure this file exists

const NavigationBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">Hawk-Eye</div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        {/* Logout Button (Pushes to Bottom) */}
        <div className="logout-container">
          <button className="logout-button">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
