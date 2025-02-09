// src/components/CandidateTable.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateTable.css";

import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";

const CandidateTable = () => {
  const navigate = useNavigate();

  // Combine data for the table
  const combinedCandidates = ashbyMockData.map((ashbyItem, index) => {
    const matchingMeta = metaviewMockData.find(
      (metaItem) => metaItem.candidateName === ashbyItem.candidateName
    );

    return {
      candidate_id: index + 1,
      name: ashbyItem.candidateName,
      department: ashbyItem.jobTitle || "Engineering",
      interview_date: ashbyItem.interviewDate,
      ashbyScores: ashbyItem.scores,
      ashbyFeedback: ashbyItem.feedback,
      metaviewTranscript: matchingMeta ? matchingMeta.transcript : []
    };
  });

  // Existing filter & sort logic
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredCandidates = combinedCandidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleViewCandidate = (candidateId) => {
    // Navigate to /candidate/:candidateId
    navigate(`/candidate/${candidateId}`);
  };

  return (
    <div className="candidate-table">
      <h2>Candidate List</h2>
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>
              Name {sortKey === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("department")}>
              Department{" "}
              {sortKey === "department" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("interview_date")}>
              Interview Date{" "}
              {sortKey === "interview_date" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((candidate) => (
            <tr key={candidate.candidate_id}>
              <td>{candidate.name}</td>
              <td>{candidate.department}</td>
              <td>
                {candidate.interview_date
                  ? new Date(candidate.interview_date).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <button onClick={() => handleViewCandidate(candidate.candidate_id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;

