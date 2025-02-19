// src/components/CandidateTable.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles.css';

const CandidateTable = ({ candidates }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  // Filter candidates based on name
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort candidates based on sortKey and sortOrder
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

  return (
    <div className="candidate-table">
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
              Name {sortKey === "name" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("department")}>
              Department {sortKey === "department" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("interview_date")}>
              Interview Date {sortKey === "interview_date" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((candidate) => (
            <tr key={candidate.candidate_id}>
              <td>{candidate.name}</td>
              <td>{candidate.department}</td>
              <td>{new Date(candidate.interview_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => navigate(`/candidate/${candidate.candidate_id}`)}>
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

