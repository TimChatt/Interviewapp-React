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

// For reference, if you want to map question IDs to categories:
const QUESTION_BANK = {
  q1: "System Design",
  q2: "Data Structures",
  q3: "Behavioral / Team Fit"
};

// Identify top keywords from the transcript (placeholder logic).
function getTopKeywords(transcriptEntries, limit = 5) {
  const freqMap = {};
  transcriptEntries.forEach((entry) => {
    const text = (entry.question + " " + entry.candidateAnswer).toLowerCase();
    const words = text.split(/\s+/);
    words.forEach((word) => {
      if (word.length < 3) return;
      freqMap[word] = (freqMap[word] || 0) + 1;
    });
  });

  const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, limit).map(([keyword, count]) => ({ keyword, count }));
}

// Calculate speaking ratio: total words from candidate vs. interviewer.
function getSpeakingRatio(transcriptEntries) {
  let candidateWords = 0;
  let interviewerWords = 0;
  transcriptEntries.forEach((entry) => {
    candidateWords += (entry.candidateAnswer || "").split(/\s+/).filter(Boolean).length;
    interviewerWords += (entry.question || "").split(/\s+/).filter(Boolean).length;
  });
  return { candidateWords, interviewerWords };
}

// Simple risk detection based on skill thresholds (example).
function detectRedFlags(candidate) {
  const flags = [];
  if (candidate.ashbyScores?.teamFit < 3) {
    flags.push("Candidate has a low team fit score (<3).");
  }
  if (candidate.ashbyScores?.adaptability < 3) {
    flags.push("Candidate scored poorly on adaptability.");
  }
  return flags;
}

// Check feedback for culture/team references (mock logic).
function getCultureFitNotes(candidate) {
  if (!candidate.ashbyFeedback) return [];
  return candidate.ashbyFeedback
    .filter((f) => f.summary.toLowerCase().includes("team fit") || f.summary.toLowerCase().includes("culture"))
    .map((f) => `Interviewer ${f.interviewerName} mentioned: "${f.summary}"`);
}

// Next steps: e.g., if problemSolving < 3 or candidate is archived.
function getNextSteps(candidate) {
  const steps = [];
  if (candidate.ashbyScores?.problemSolving < 3) {
    steps.push("Recommend an additional technical round focusing on problem-solving.");
  }
  if (candidate.status === "Archived") {
    steps.push("Candidate is archived. Consider feedback for future improvements.");
  }
  return steps;
}

// Basic auto-summary combining top skill + transcript length.
function generateAutoSummary(candidate, transcriptEntries) {
  let summary = "";
  const scores = candidate.ashbyScores || {};
  const topSkill = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (topSkill) {
    summary += `The candidate's strongest competency is ${topSkill[0]} with a score of ${topSkill[1]}. `;
  }
  const totalExchanges = transcriptEntries.length;
  summary += `There were ${totalExchanges} Q&A exchanges in the interview.`;
  return summary;
}

function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Merge Ashby & Metaview data
  const combinedCandidates = ashbyMockData.map((ashbyItem, index) => {
    const matchingMeta = metaviewMockData.find(
      (metaItem) => metaItem.candidateName === ashbyItem.candidateName
    );
    return {
      candidate_id: index + 1,
      name: ashbyItem.candidateName,
      jobTitle: ashbyItem.jobTitle,
      status: ashbyItem.status,
      interviewStage: ashbyItem.interviewStage,
      interview_date: ashbyItem.interviewDate,
      ashbyScores: ashbyItem.scores,
      ashbyFeedback: ashbyItem.feedback,
      aiAdvice: ashbyItem.aiAdvice || null,
      timeline: ashbyItem.timeline || [],
      metaviewTranscript: matchingMeta ? matchingMeta.transcript : []
    };
  });

  const candidate = combinedCandidates.find(
    (item) => item.candidate_id.toString() === candidateId
  );

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

  // Prepare data for the UI
  const transcript = candidate.metaviewTranscript || [];
  const radarData = [];
  if (candidate.ashbyScores) {
    for (let [skillKey, score] of Object.entries(candidate.ashbyScores)) {
      radarData.push({
        skillKey,
        skillLabel: skillKey,
        candidateScore: score
      });
    }
  }
  const { candidateWords, interviewerWords } = getSpeakingRatio(transcript);
  const totalWords = candidateWords + interviewerWords || 1;
  const candidateRatio = ((candidateWords / totalWords) * 100).toFixed(1);
  const interviewerRatio = ((interviewerWords / totalWords) * 100).toFixed(1);
  const topKeywords = getTopKeywords(transcript);
  const redFlags = detectRedFlags(candidate);
  const cultureNotes = getCultureFitNotes(candidate);
  const nextSteps = getNextSteps(candidate);
  const autoSummary = generateAutoSummary(candidate, transcript);

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
            <strong>Interview Date:</strong>{" "}
            {candidate.interview_date
              ? new Date(candidate.interview_date).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="candidate-status">
            <strong>Status:</strong> {candidate.status}
          </p>
          <p className="candidate-stage">
            <strong>Interview Stage:</strong> {candidate.interviewStage || "Unknown"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="candidate-body">
        {/* LEFT COLUMN */}
        <div className="profile-left">
          {/* TIMELINE */}
          <div className="timeline-section">
            <h2>Interview Timeline</h2>
            {candidate.timeline.length > 0 ? (
              <ul>
                {candidate.timeline.map((t, idx) => (
                  <li key={idx}>
                    <strong>{t.stage}</strong> – {new Date(t.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No timeline data available.</p>
            )}
          </div>

          {/* SCORECARD & RADAR */}
          <div className="scorecard-section">
            <h2>Scorecard</h2>
            {candidate.ashbyScores ? (
              <ul className="score-list">
                {Object.entries(candidate.ashbyScores).map(([skillKey, score]) => (
                  <li key={skillKey}>
                    <strong>{skillKey}:</strong> {score}
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
                  <PolarAngleAxis dataKey="skillLabel" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar
                    name="Candidate"
                    dataKey="candidateScore"
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
          </div>

          {/* ATTACHMENTS */}
          <div className="attachments-section">
            <h2>Candidate Attachments</h2>
            <p>Resume: <a href="#">View / Download</a></p>
            <p>Coding Test: <a href="#">Link to GitHub Gist</a></p>
          </div>

          {/* RED FLAGS */}
          {redFlags.length > 0 && (
            <div className="red-flags-section">
              <h3>Potential Risk Areas</h3>
              <ul>
                {redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CULTURE FIT */}
          {cultureNotes.length > 0 && (
            <div className="culture-fit-section">
              <h3>Culture / Team Fit Notes</h3>
              <ul>
                {cultureNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* NEXT STEPS */}
          {nextSteps.length > 0 && (
            <div className="next-steps-section">
              <h3>Recommended Next Steps</h3>
              <ul>
                {nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI ADVICE (New) */}
          {candidate.aiAdvice && (
            <div className="ai-advice-section">
              <h3>AI Advice</h3>
              {/* General commentary */}
              <p>{candidate.aiAdvice.general}</p>

              {/* Did Well */}
              {candidate.aiAdvice.didWell && candidate.aiAdvice.didWell.length > 0 && (
                <div className="did-well-section">
                  <h4>What Went Well</h4>
                  <ul>
                    {candidate.aiAdvice.didWell.map((dw, idx) => (
                      <li key={idx}>
                        {dw.point}
                        {dw.citation && (
                          <span className="citation"> ({dw.citation})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Could Improve */}
              {candidate.aiAdvice.couldImprove && candidate.aiAdvice.couldImprove.length > 0 && (
                <div className="could-improve-section">
                  <h4>Areas to Improve</h4>
                  <ul>
                    {candidate.aiAdvice.couldImprove.map((ci, idx) => (
                      <li key={idx}>
                        {ci.point}
                        {ci.citation && (
                          <span className="citation"> ({ci.citation})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right">
          <h2>Interview Transcript & Analysis</h2>
          <p>
            <strong>Speaking Ratio:</strong> Candidate {candidateRatio}% / Interviewer {interviewerRatio}%
          </p>

          {topKeywords.length > 0 && (
            <div className="keyword-section">
              <h4>Top Keywords</h4>
              <ul>
                {topKeywords.map((kw, idx) => (
                  <li key={idx}>
                    {kw.keyword} ({kw.count})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="transcript-section">
            <h3>Transcript</h3>
            {transcript.map((entry, idx) => (
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
          </div>
        </div>
      </div>

      {/* AUTO SUMMARY */}
      <div className="auto-summary-section">
        <h2>Auto Summary</h2>
        <p>{autoSummary}</p>
      </div>
    </div>
  );
}

export default CandidateProfile;
