// src/pages/CandidateProfile.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";

function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Combine data exactly like in CandidateTable
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

  // Find the one that matches candidateId param
  const candidate = combinedCandidates.find(
    (item) => item.candidate_id.toString() === candidateId
  );

  // If not found, show an error or redirect
  if (!candidate) {
    return (
      <div>
        <h2>Candidate not found</h2>
        <button onClick={() => navigate("/candidates")}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Candidate Profile</h1>
      <h2>{candidate.name}</h2>
      <p>Department: {candidate.department}</p>
      <p>Interview Date: 
        {candidate.interview_date
          ? new Date(candidate.interview_date).toLocaleDateString()
          : "N/A"}
      </p>

      {/* Scores */}
      {candidate.ashbyScores && (
        <div>
          <h3>Scorecard</h3>
          <ul>
            {Object.entries(candidate.ashbyScores).map(([skill, score]) => (
              <li key={skill}>
                <strong>{skill}:</strong> {score}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      {candidate.ashbyFeedback && candidate.ashbyFeedback.length > 0 && (
        <div>
          <h3>Feedback</h3>
          {candidate.ashbyFeedback.map((feedbackItem, idx) => (
            <p key={idx}>
              <strong>{feedbackItem.interviewerName}:</strong>{" "}
              {feedbackItem.summary}
            </p>
          ))}
        </div>
      )}

      {/* Metaview Transcript */}
      {candidate.metaviewTranscript && candidate.metaviewTranscript.length > 0 && (
        <div>
          <h3>Transcript</h3>
          {candidate.metaviewTranscript.map((entry, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{entry.speaker}</strong>: {entry.question}
              <br />
              <em>Answer: {entry.candidateAnswer}</em>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <button onClick={() => navigate("/candidates")}>Back to List</button>
    </div>
  );
}

export default CandidateProfile;
