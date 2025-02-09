// src/pages/CandidateProfile.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";

import ashbyMockData from "../mockdata/ashbyMockData.json";
import metaviewMockData from "../mockdata/metaviewMockData.json";
import "./CandidateProfile.css";

// Mapping raw skills to user-friendly labels
const skillLabels = {
  technicalSkills: "Technical Skills",
  communication: "Communication",
  problemSolving: "Problem Solving",
  teamFit: "Team Fit",
  adaptability: "Adaptability"
};

function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // 1. Merge data from Ashby + Metaview
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

  // 2. Find matching candidate
  const candidate = combinedCandidates.find(
    (item) => item.candidate_id.toString() === candidateId
  );

  // 3. If not found, show an error or redirect
  if (!candidate) {
    return (
      <div className="candidate-profile-page">
        <h2>Candidate not found</h2>
        <button className="back-button" onClick={() => navigate("/candidates")}>
          Go Back
        </button>
      </div>
    );
  }

  // 4. Create radar data and label the skills nicely
  let radarData = [];
  if (candidate.ashbyScores) {
    radarData = Object.entries(candidate.ashbyScores).map(([skillKey, score]) => ({
      skillKey,
      // If we have a label, use it, otherwise just show the raw key
      skillLabel: skillLabels[skillKey] || skillKey,
      score
    }));
  }

  // 5. Format date
  const formattedDate = candidate.interview_date
    ? new Date(candidate.interview_date).toLocaleDateString()
    : "N/A";

  // 6. Expandable transcript logic
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const transcript = candidate.metaviewTranscript || [];
  const MAX_VISIBLE_ENTRIES = 3;

  // If not expanded, limit the visible transcript entries
  const visibleTranscript = transcriptExpanded
    ? transcript
    : transcript.slice(0, MAX_VISIBLE_ENTRIES);

  const handleToggleTranscript = () => {
    setTranscriptExpanded((prev) => !prev);
  };

  // 7. Render
  return (
    <div className="candidate-profile-page">
      <button className="back-button" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </button>

      {/* Header: Basic Info */}
      <div className="candidate-header">
        <div className="candidate-info">
          <h1 className="candidate-name">{candidate.name}</h1>
          <p className="candidate-department">
            <strong>Department:</strong> {candidate.department}
          </p>
          <p className="candidate-interview-date">
            <strong>Interview Date:</strong> {formattedDate}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="candidate-body">
        {/* Left Column: Scorecard + Radar */}
        <div className="scorecard-section">
          <h2>Scorecard</h2>
          {candidate.ashbyScores ? (
            <ul className="score-list">
              {Object.entries(candidate.ashbyScores).map(([skillKey, score]) => (
                <li key={skillKey}>
                  <span className="score-skill">
                    {skillLabels[skillKey] || skillKey}
                  </span>
                  : {score}
                </li>
              ))}
            </ul>
          ) : (
            <p>No scores available.</p>
          )}

          {radarData.length > 0 && (
            <div className="radar-chart-wrapper">
              <h3>Competency Radar</h3>
              <RadarChart
                outerRadius={90}
                width={400}
                height={300}
                data={radarData}
                animationBegin={300}
              >
                <PolarGrid />
                {/* We'll use skillLabel as the axis label */}
                <PolarAngleAxis dataKey="skillLabel" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  isAnimationActive={true}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </div>
          )}

          {candidate.ashbyFeedback && candidate.ashbyFeedback.length > 0 && (
            <div className="feedback-section">
              <h3>Interviewer Feedback</h3>
              {candidate.ashbyFeedback.map((feedbackItem, idx) => (
                <div key={idx} className="feedback-card">
                  <strong>{feedbackItem.interviewerName}</strong>
                  <p>{feedbackItem.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Transcript */}
        <div className="transcript-section">
          <h2>Interview Transcript</h2>
          {visibleTranscript.length > 0 ? (
            <>
              {visibleTranscript.map((entry, idx) => (
                <div key={idx} className="transcript-entry">
                  <p>
                    <strong>{entry.speaker}:</strong> {entry.question}
                  </p>
                  <p>
                    <em>Answer: {entry.candidateAnswer}</em>
                  </p>
                  <hr />
                </div>
              ))}
              {/* Show More / Show Less if there's more than MAX_VISIBLE_ENTRIES */}
              {transcript.length > MAX_VISIBLE_ENTRIES && (
                <button className="transcript-toggle" onClick={handleToggleTranscript}>
                  {transcriptExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </>
          ) : (
            <p>No transcript available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
