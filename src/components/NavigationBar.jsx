// src/components/NavigationBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-berry-ui";

const NavigationBar = () => {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#333",
        color: "#fff",
        display: "flex",
        gap: "15px",
        alignItems: "center"
      }}
    >
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha" size="lg">
          Dashboard Overview
        </Button>
      </Link>
      <Link to="/candidates" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha" size="lg">
          Candidates
        </Button>
      </Link>
      <Link to="/insights" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha" size="lg">
          Insights
        </Button>
      </Link>
      <Link to="/recommendations" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha" size="lg">
          Recommendations
        </Button>
      </Link>
      <Link to="/admin" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha" size="lg">
          Admin
        </Button>
      </Link>
    </div>
  );
};

export default NavigationBar;

