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

// Mapping raw skill keys -> user-friendly labels
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
      jobTitle: ashbyItem.jobTitle,
      status: ashbyItem.status, // "Hired" or "Archived"
      interview_date: ashbyItem.interviewDate,
      ashbyScores: ashbyItem.scores,
      ashbyFeedback: ashbyItem.feedback,
      aiAdvice: ashbyItem.aiAdvice || null,
      metaviewTranscript: matchingMeta ? matchingMeta.transcript : []
    };
  });

  // 2. Find the candidate by ID
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

  // 4. If candidate is "Archived", find a "Hired" candidate with the same jobTitle
  let hiredComparator = null;
  if (candidate.status === "Archived" && candidate.jobTitle) {
    hiredComparator = combinedCandidates.find(
      (c) => c.jobTitle === candidate.jobTitle && c.status === "Hired"
    );
  }

  // 5. Build radar data
  // If we have a hired comparator, overlay both sets of scores
  let radarData = [];
  const candidateScores = candidate.ashbyScores || {};

  if (hiredComparator) {
    const hiredScores = hiredComparator.ashbyScores || {};
    // Merge each skill into a single object with candidateScore & hiredScore
    const allSkills = new Set([
      ...Object.keys(candidateScores),
      ...Object.keys(hiredScores)
    ]);

    radarData = Array.from(allSkills).map((skillKey) => ({
      skillKey,
      skillLabel: skillLabels[skillKey] || skillKey,
      candidateScore: candidateScores[skillKey] || 0,
      hiredScore: hiredScores[skillKey] || 0
    }));
  } else {
    // No comparator or candidate is "Hired": just show single candidate's scores
    radarData = Object.entries(candidateScores).map(([skillKey, score]) => ({
      skillKey,
      skillLabel: skillLabels[skillKey] || skillKey,
      candidateScore: score
    }));
  }

  // 6. Format interview date
  const formattedDate = candidate.interview_date
    ? new Date(candidate.interview_date).toLocaleDateString()
    : "N/A";

  // 7. Expandable transcript logic
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const transcript = candidate.metaviewTranscript || [];
  const MAX_VISIBLE_ENTRIES = 3;

  const visibleTranscript = transcriptExpanded
    ? transcript
    : transcript.slice(0, MAX_VISIBLE_ENTRIES);

  const handleToggleTranscript = () => {
    setTranscriptExpanded((prev) => !prev);
  };

  // 8. Third-person “fairness check” message
  let fairnessMessage = "";
  if (candidate.status === "Archived" && hiredComparator) {
    const candidateTechnical = candidateScores.technicalSkills || 0;
    const hiredTechnical = hiredComparator.ashbyScores.technicalSkills || 0;
    fairnessMessage = `When compared to a successful candidate for the same role, the archived candidate's technical skills score was ${candidateTechnical}, while the hired candidate's was ${hiredTechnical}. Historical data suggests that demonstrating more depth in advanced topics can lead to higher ratings.`;
  }

  return (
    <div className="candidate-profile-page">
      <button className="back-button" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </button>

      {/* Header */}
      <div className="candidate-header">
        <div className="candidate-info">
          <h1 className="candidate-name">{candidate.name}</h1>
          <p className="candidate-department">
            <strong>Job Title:</strong> {candidate.jobTitle}
          </p>
          <p className="candidate-interview-date">
            <strong>Interview Date:</strong> {formattedDate}
          </p>
          <p className="candidate-status">
            <strong>Status:</strong> {candidate.status}
          </p>
        </div>
      </div>

      <div className="candidate-body">
        {/* Left Column: Scorecard + Radar */}
        <div className="scorecard-section">
          <h2>Scorecard</h2>
          {Object.keys(candidateScores).length > 0 ? (
            <ul className="score-list">
              {Object.entries(candidateScores).map(([skillKey, score]) => (
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

          {/* Radar Chart (overlay if archived w/ comparator) */}
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
                <PolarAngleAxis dataKey="skillLabel" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />

                {/* Candidate's Radar */}
                <Radar
                  name="Archived Candidate"
                  dataKey="candidateScore"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  isAnimationActive={true}
                />

                {/* If there's a hired comparator, overlay their scores, but hide name */}
                {hiredComparator && (
                  <Radar
                    name="Hired Candidate"
                    dataKey="hiredScore"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.4}
                    isAnimationActive={true}
                  />
                )}

                <Tooltip />
                <Legend />
              </RadarChart>
            </div>
          )}

          {/* Interviewer Feedback */}
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

          {/* Fairness Check (Archived Only) */}
          {candidate.status === "Archived" && fairnessMessage && (
            <div className="fairness-section">
              <h3>Score Fairness Check</h3>
              <p>{fairnessMessage}</p>
            </div>
          )}

          {/* AI Advice (Archived Only, third-person wording) */}
          {candidate.status === "Archived" && candidate.aiAdvice && (
            <div className="ai-advice-section">
              <h3>AI Advice</h3>
              <p>{candidate.aiAdvice.general}</p>
              {candidate.aiAdvice.improveTechnicalSkills && (
                <>
                  <h4>Improving Technical Skills</h4>
                  <p>{candidate.aiAdvice.improveTechnicalSkills}</p>
                </>
              )}
              {candidate.aiAdvice.improveProblemSolving && (
                <>
                  <h4>Improving Problem-Solving</h4>
                  <p>{candidate.aiAdvice.improveProblemSolving}</p>
                </>
              )}
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

