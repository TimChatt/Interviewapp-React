// src/pages/Candidate.jsx
import React, { useState } from "react";
import CandidateTable from "../components/CandidateTable";
import candidateData from "../mockdata/ashbyMockData.json"; // Your candidate data
import "./Candidate.css";

const Candidate = () => {
  // Transform candidate data so that keys match CandidateTable's expectations
  const transformedCandidates = candidateData.map((candidate, index) => ({
    candidate_id: index + 1,
    name: candidate.candidateName,
    // Use jobTitle as department for simplicity or map it appropriately
    department: candidate.jobTitle,
    interview_date: candidate.interviewDate,
    status: candidate.status, // e.g., "Hired" or "Archived"
    // include any additional properties CandidateTable might use
  }));

  // Create a filter state for candidate status
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter candidates based on the selected status
  const filteredCandidates = transformedCandidates.filter((candidate) => {
    if (statusFilter === "All") return true;
    return candidate.status === statusFilter;
  });

  // Compute summary stats
  const totalCandidates = transformedCandidates.length;
  const hiredCount = transformedCandidates.filter((c) => c.status === "Hired").length;
  const archivedCount = transformedCandidates.filter((c) => c.status === "Archived").length;

  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>

      {/* Summary Stats */}
      <div className="candidate-summary">
        <div className="stat-card">
          <h2>Total Candidates</h2>
          <p>{totalCandidates}</p>
        </div>
        <div className="stat-card">
          <h2>Hired</h2>
          <p>{hiredCount}</p>
        </div>
        <div className="stat-card">
          <h2>Archived</h2>
          <p>{archivedCount}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Hired">Hired</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Candidate Table */}
      <div className="candidate-list-container">
        <CandidateTable candidates={filteredCandidates} />
      </div>
    </div>
  );
};

export default Candidate;
