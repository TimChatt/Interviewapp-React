// src/pages/Candidate.jsx
import React from "react";
import CandidateTable from "../components/CandidateTable";
import "./Candidate.css";

const Candidate = () => {
  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>
      <div className="candidate-list-container">
        <CandidateTable />
      </div>
    </div>
  );
};

export default Candidate;
