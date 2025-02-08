import React from "react";
import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#333", color: "#fff" }}>
      <ul style={{ listStyle: "none", display: "flex", gap: "15px" }}>
        <li>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Dashboard Overview</Link>
        </li>
        <li>
          <Link to="/candidate" style={{ color: "#fff", textDecoration: "none" }}>Candidate</Link>
        </li>
        <li>
          <Link to="/insights" style={{ color: "#fff", textDecoration: "none" }}>Insights</Link>
        </li>
        <li>
          <Link to="/recommendations" style={{ color: "#fff", textDecoration: "none" }}>Recommendations</Link>
        </li>
        <li>
          <Link to="/admin" style={{ color: "#fff", textDecoration: "none" }}>Admin</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;

