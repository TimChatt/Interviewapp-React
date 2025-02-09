// src/pages/Candidate.jsx
import React from "react";
import CandidateTable from "../components/CandidateTable";
import "./Candidate.css";

const Candidate = () => {
  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>
      {/* Simply render the table. The table itself merges data from ashbyMockData.json and metaviewMockData.json */}
      <CandidateTable />
    </div>
  );
};

export default Candidate;


