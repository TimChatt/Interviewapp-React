import React, { useState } from "react";
import "./CandidateTable.css"; // Add CSS for styling the table

const CandidateTable = ({ candidates }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter candidates based on filter input
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort candidates based on selected sortKey and sortOrder
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting
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
              <td>{new Date(candidate.interview_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => alert(`Viewing ${candidate.name}`)}>
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

