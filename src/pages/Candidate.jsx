// src/pages/Candidate.jsx
import React from "react";
import CandidateTable from "../components/CandidateTable";
import candidateData from "../mockdata/ashbyMockData.json";  // Import candidate data
import "./Candidate.css";

const Candidate = () => {
  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>
      <div className="candidate-list-container">
        <CandidateTable candidates={candidateData} />
      </div>
    </div>
  );
};

export default Candidate;
