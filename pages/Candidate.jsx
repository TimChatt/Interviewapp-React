import React, { useState } from "react";
import CandidateTable from "../components/CandidateTable";
import "./Candidate.css"; // For styling the Candidate page

const mockCandidates = [
  {
    candidate_id: "1",
    name: "Alice Smith",
    department: "Engineering",
    interview_date: "2025-02-01",
    interviewer: "John Doe",
    interview_transcript: "Alice demonstrated excellent technical skills.",
    scorecard: [
      { category: "technical", score: 4, ai_predicted_score: 4.5 },
      { category: "communication", score: 3, ai_predicted_score: 4 },
    ],
  },
  {
    candidate_id: "2",
    name: "Bob Johnson",
    department: "Operations",
    interview_date: "2025-02-03",
    interviewer: "Jane Doe",
    interview_transcript: "Bob has good operational knowledge.",
    scorecard: [
      { category: "technical", score: 3, ai_predicted_score: 3.5 },
      { category: "teamwork", score: 4, ai_predicted_score: 4.2 },
    ],
  },
];

const Candidate = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Handle candidate selection
  const handleCandidateSelect = (candidateId) => {
    const candidate = mockCandidates.find((c) => c.candidate_id === candidateId);
    setSelectedCandidate(candidate);
  };

  return (
    <div className="candidate-page">
      <h1>Candidate Management</h1>

      {/* Candidate Table */}
      {!selectedCandidate ? (
        <div className="candidate-section">
          <h2>Search Candidates</h2>
          <CandidateTable
            candidates={mockCandidates}
            onRowClick={(candidateId) => handleCandidateSelect(candidateId)}
          />
        </div>
      ) : (
        // Candidate Profile View
        <div className="candidate-section">
          <h2>Candidate Profile</h2>
          <button
            className="back-button"
            onClick={() => setSelectedCandidate(null)}
          >
            Back to Search
          </button>
          <div className="candidate-profile">
            <h3>{selectedCandidate.name}</h3>
            <p><strong>Department:</strong> {selectedCandidate.department}</p>
            <p><strong>Interview Date:</strong> {selectedCandidate.interview_date}</p>
            <p><strong>Interviewer:</strong> {selectedCandidate.interviewer}</p>
            <h4>Interview Transcript</h4>
            <p>{selectedCandidate.interview_transcript}</p>
            <h4>Scorecard</h4>
            <ul>
              {selectedCandidate.scorecard.map((score, index) => (
                <li key={index}>
                  <strong>{score.category}:</strong> {score.score} (AI Predicted:{" "}
                  {score.ai_predicted_score})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidate;

