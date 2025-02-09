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

// We assume you might have a separate JSON or logic that maps question ID -> question category
const QUESTION_BANK = {
  "q1": "System Design",
  "q2": "Data Structures",
  "q3": "Behavioral / Team Fit"
  // ... etc.
};

/**
 * Utility to identify top keywords from a transcript.
 * Placeholder logic: just splits text by space and counts frequency.
 * Real approach: use an NLP library, filter out stopwords, etc.
 */
function getTopKeywords(transcriptEntries, limit = 5) {
  const freqMap = {};
  transcriptEntries.forEach((entry) => {
    // Combine question + answer text for naive analysis
    const text = (entry.question + " " + entry.candidateAnswer).toLowerCase();
    const words = text.split(/\s+/);
    words.forEach((word) => {
      // skip very short words or stopwords
      if (word.length < 3) return;
      freqMap[word] = (freqMap[word] || 0) + 1;
    });
  });

  // Convert to array and sort
  const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, limit).map(([keyword, count]) => ({ keyword, count }));
}

/**
 * Calculate speaking ratio: total words (or characters) by candidate vs. interviewer(s).
 */
function getSpeakingRatio(transcriptEntries) {
  let candidateWords = 0;
  let interviewerWords = 0;

  transcriptEntries.forEach((entry) => {
    // Candidate answer word count
    candidateWords += (entry.candidateAnswer || "").split(/\s+/).filter(Boolean).length;
    // Interviewer question word count
    interviewerWords += (entry.question || "").split(/\s+/).filter(Boolean).length;
  });

  return { candidateWords, interviewerWords };
}

/**
 * Simple risk detection: if a candidate is missing certain required skills or
 * if the "teamFit" is below a threshold, we can mark them as a "Potential Risk."
 */
function detectRedFlags(candidate) {
  const flags = [];

  // Example: If teamFit < 3, add a red flag
  if (candidate.ashbyScores?.teamFit && candidate.ashbyScores.teamFit < 3) {
    flags.push("Candidate has a low team fit score (<3).");
  }
  // If adaptability < 3, for example
  if (candidate.ashbyScores?.adaptability && candidate.ashbyScores.adaptability < 3) {
    flags.push("Candidate scored poorly on adaptability.");
  }

  // You could check transcript for certain negative keywords, etc.
  // For now, just returning flags based on numeric scores
  return flags;
}

/**
 * Example cultural/team fit extraction:
 * - We'll parse the interview feedback to see if 'culture' or 'team' is mentioned.
 * - You could store a separate field or do advanced NLP. 
 * Here, we do a mock parse to gather interviewer remarks about culture/team.
 */
function getCultureFitNotes(candidate) {
  if (!candidate.ashbyFeedback) return [];
  return candidate.ashbyFeedback
    .filter((f) => f.summary.toLowerCase().includes("team fit") || f.summary.toLowerCase().includes("culture"))
    .map((f) => `Interviewer ${f.interviewerName} mentioned: "${f.summary}"`);
}

/**
 * Identify possible next steps based on interview notes.
 * For instance, if the transcript ended with "We will follow up with a system design test"
 * or if the scores are borderline, you might recommend another round.
 */
function getNextSteps(candidate) {
  // Simple example: if problemSolving < 3, recommend additional technical round
  const steps = [];
  if (candidate.ashbyScores?.problemSolving < 3) {
    steps.push("Recommend an additional technical round focusing on problem-solving.");
  }
  if (candidate.status === "Archived") {
    steps.push("Candidate is archived. Consider feedback for future improvements.");
  }
  return steps;
}

/**
 * Basic function to build an "auto-summary" from interview data. 
 * In reality, you'd call an external API or use an NLP model for a custom summary.
 */
function generateAutoSummary(candidate, transcriptEntries) {
  let summary = "";

  // Mention the candidate's top skill from the scorecard
  const scores = candidate.ashbyScores || {};
  const topSkill = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (topSkill) {
    summary += `The candidate's strongest competency is ${topSkill[0]} with a score of ${topSkill[1]}. `;
  }

  // Summarize transcript length
  const totalExchanges = transcriptEntries.length;
  summary += `There were ${totalExchanges} Q&A exchanges in the interview.`;

  return summary;
}

function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Merge data from Ashby + Metaview
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
      // For timeline, we might store a separate array of interview stage data or just mock it
      timeline: ashbyItem.timeline || [ 
        { stage: "Applied", date: "2025-01-20" },
        { stage: "Phone Screen", date: "2025-01-25" },
        { stage: "Onsite", date: "2025-02-01" }
      ],
      metaviewTranscript: matchingMeta ? matchingMeta.transcript : []
    };
  });

  // Find the candidate
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

  const transcript = candidate.metaviewTranscript || [];

  // Radar data (single candidate)
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

  // Speaking ratio
  const { candidateWords, interviewerWords } = getSpeakingRatio(transcript);
  const totalWords = candidateWords + interviewerWords || 1; // avoid divide by zero
  const candidateRatio = ((candidateWords / totalWords) * 100).toFixed(1);
  const interviewerRatio = ((interviewerWords / totalWords) * 100).toFixed(1);

  // Keywords
  const topKeywords = getTopKeywords(transcript);

  // Red flags
  const redFlags = detectRedFlags(candidate);

  // Culture/team fit
  const cultureNotes = getCultureFitNotes(candidate);

  // Next steps
  const nextSteps = getNextSteps(candidate);

  // Auto summary
  const autoSummary = generateAutoSummary(candidate, transcript);

  return (
    <div className="candidate-profile-page">
      <button className="back-button" onClick={() => navigate("/candidates")}>
        &larr; Back to Candidates
      </button>

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

      <div className="candidate-body">
        {/* Left Column */}
        <div className="profile-left">
          {/* Timeline / Progress */}
          <div className="timeline-section">
            <h2>Interview Timeline</h2>
            {candidate.timeline && candidate.timeline.length > 0 ? (
              <ul>
                {candidate.timeline.map((t, idx) => (
                  <li key={idx}>
                    <strong>{t.stage}</strong> - {new Date(t.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No timeline data available.</p>
            )}
          </div>

          {/* Scorecard & Radar */}
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

          {/* Attachments / Resume (Placeholder) */}
          <div className="attachments-section">
            <h2>Candidate Attachments</h2>
            <p>Resume: <a href="#">View / Download</a></p>
            <p>Coding Test: <a href="#">Link to GitHub Gist</a></p>
            {/* Integrate real links or embedded if you have them */}
          </div>

          {/* Red Flags / Risk */}
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

          {/* Culture / Team Fit */}
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

          {/* Next Steps */}
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
        </div>

        {/* Right Column */}
        <div className="profile-right">
          <h2>Interview Transcript & Analysis</h2>
          {/* Basic stats about speaking ratio */}
          <p>
            <strong>Speaking Ratio:</strong> Candidate {candidateRatio}% / Interviewer {interviewerRatio}%
          </p>

          {/* Top Keywords */}
          {topKeywords.length > 0 && (
            <div className="keyword-section">
              <h4>Top Keywords</h4>
              <ul>
                {topKeywords.map((kw, idx) => (
                  <li key={idx}>{kw.keyword} ({kw.count})</li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Transcript */}
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
                {/* You could map entry.question to QUESTION_BANK if you stored a question ID */}
                <hr />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-generated summary */}
      <div className="auto-summary-section">
        <h2>Auto Summary</h2>
        <p>{autoSummary}</p>
      </div>
    </div>
  );
}

export default CandidateProfile;
