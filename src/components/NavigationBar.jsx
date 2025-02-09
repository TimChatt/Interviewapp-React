import React from "react";
import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#333", color: "#fff" }}>
      <ul style={{ listStyle: "none", display: "flex", gap: "15px", margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Dashboard Overview
          </Link>
        </li>
        <li>
          {/* Changed to /candidates to match the new route */}
          <Link to="/candidates" style={{ color: "#fff", textDecoration: "none" }}>
            Candidates
          </Link>
        </li>
        <li>
          <Link to="/insights" style={{ color: "#fff", textDecoration: "none" }}>
            Insights
          </Link>
        </li>
        <li>
          <Link to="/recommendations" style={{ color: "#fff", textDecoration: "none" }}>
            Recommendations
          </Link>
        </li>
        <li>
          <Link to="/admin" style={{ color: "#fff", textDecoration: "none" }}>
            Admin
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
