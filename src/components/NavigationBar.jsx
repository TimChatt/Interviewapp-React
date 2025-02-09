// src/components/NavigationBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-berry-ui"; // Using Berry UI Button
import "./NavigationBar.css";

const NavigationBar = () => {
  return (
    <div className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button variant="ghost" colorScheme="whiteAlpha" size="lg" className="nav-button">
              Dashboard Overview
            </Button>
          </Link>
          <Link to="/candidates" style={{ textDecoration: "none" }}>
            <Button variant="ghost" colorScheme="whiteAlpha" size="lg" className="nav-button">
              Candidates
            </Button>
          </Link>
          <Link to="/insights" style={{ textDecoration: "none" }}>
            <Button variant="ghost" colorScheme="whiteAlpha" size="lg" className="nav-button">
              Insights
            </Button>
          </Link>
          <Link to="/recommendations" style={{ textDecoration: "none" }}>
            <Button variant="ghost" colorScheme="whiteAlpha" size="lg" className="nav-button">
              Recommendations
            </Button>
          </Link>
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <Button variant="ghost" colorScheme="whiteAlpha" size="lg" className="nav-button">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
