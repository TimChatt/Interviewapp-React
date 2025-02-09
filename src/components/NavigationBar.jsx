import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-berry-ui"; // Still import Button from Berry UI

const NavigationBar = () => {
  return (
    <div style={{ padding: "10px", backgroundColor: "#333", color: "#fff", display: "flex", gap: "15px" }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha">
          Dashboard Overview
        </Button>
      </Link>
      <Link to="/candidates" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha">
          Candidates
        </Button>
      </Link>
      <Link to="/insights" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha">
          Insights
        </Button>
      </Link>
      <Link to="/recommendations" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha">
          Recommendations
        </Button>
      </Link>
      <Link to="/admin" style={{ textDecoration: "none" }}>
        <Button variant="ghost" colorScheme="whiteAlpha">
          Admin
        </Button>
      </Link>
    </div>
  );
};

export default NavigationBar;

