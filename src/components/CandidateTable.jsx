import React, { useState } from "react";
import "./CandidateTable.css";

// 1. Import both JSON files (since they're in src/mockdata)
import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";

const CandidateTable = () => {
  // 2. Combine Ashby + Metaview data by candidateName
  const combinedCandidates = ashbyMockData.map((ashbyItem, index) => {
    // Find Metaview transcript that matches this candidate
    const matchingMeta = metaviewMockData.find(
      (metaItem) => metaItem.candidateName === ashbyItem.candidateName
    );

    return {
      // Use your own unique ID logic here
      candidate_id: index + 1,
      
      // The table looks for `name`, `department`, `interview_date`
      // We'll map from Ashby’s or Metaview’s fields
      name: ashbyItem.candidateName,
      department: ashbyItem.jobTitle || "Engineering", // or another field
      interview_date: ashbyItem.interviewDate,         // or combine from Metaview if needed

      // Keep any extra data you might need later (scores, transcript, etc.)
      ashbyScores: ashbyItem.scores,
      ashbyFeedback: ashbyItem.feedback,
      metaviewTranscript: matchingMeta ? matchingMeta.transcript : []
    };
  });

  // 3. Existing state for filter/sort
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // 4. Filter logic
  const filteredCandidates = combinedCandidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(filter.toLowerCase())
  );

  // 5. Sort logic
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
                {/* 
                  For a more advanced flow, you might open a details view
                  or route to a new page showing the transcript, scores, etc.
                */}
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

