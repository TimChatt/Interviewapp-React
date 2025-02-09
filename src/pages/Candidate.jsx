// src/pages/Candidate.jsx
import React from "react";
import CandidateTable from "../components/CandidateTable";
import candidateData from "../mockdata/ashbyMockData.json"; // Your candidate mock data
import "./Candidate.css";

const Candidate = () => {
  // Transform candidateData so that keys match CandidateTable's expectations.
  // For example, CandidateTable expects: candidate.name, candidate.department, candidate.interview_date, candidate.candidate_id.
  const transformedCandidates = candidateData.map((candidate, index) => ({
    candidate_id: index + 1,
    name: candidate.candidateName,        // Map candidateName to name
    department: candidate.jobTitle,         // Use jobTitle as department (or adjust as needed)
    interview_date: candidate.interviewDate,  // Map interviewDate to interview_date
    // Add any other properties if CandidateTable uses them.
  }));

  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>
      <div className="candidate-list-container">
        <CandidateTable candidates={transformedCandidates} />
      </div>
    </div>
  );
};

export default Candidate;
