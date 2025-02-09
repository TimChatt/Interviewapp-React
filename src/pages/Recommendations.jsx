// src/pages/Recommendations.jsx
import React, { useState } from "react";
import "./Recommendations.css";
import ashbyMockData from "../mockdata/ashbyMockData.json";

// Helper to parse date
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

// Mapping for user-friendly skill names
function formatSkillName(skillKey) {
  // e.g. "technicalSkills" -> "Technical Skills"
  return skillKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

// Example role-specific suggestions
const roleSuggestions = {
  "Frontend Developer": {
    recommendedTopics: [
      "React Hooks best practices and performance optimization",
      "State management patterns (Redux, Zustand, etc.)",
      "Collaboration with designers for UI/UX consistency"
    ],
    topSoftSkills: ["Communication with cross-functional teams", "Adaptability to design changes"]
  },
  "Backend Developer": {
    recommendedTopics: [
      "Database indexing and optimization",
      "Microservices architecture",
      "API versioning and documentation"
    ],
    topSoftSkills: ["Communicating complex technical topics", "System design trade-offs"]
  }
};

function Recommendations() {
  // --------------------------
  // 1) Live Filters
  // --------------------------
  // Date range + job title filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  // Filter data by date range
  const dateFiltered = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false; // or true, depending on your needs

    if (startDateObj && interviewDT < startDateObj) return false;
    if (endDateObj && interviewDT > endDateObj) return false;
    return true;
  });

  // If filterJobTitle is specified, only keep candidates matching
  const filteredData = filterJobTitle
    ? dateFiltered.filter((c) => (c.jobTitle || "").toLowerCase() === filterJobTitle.toLowerCase())
    : dateFiltered;

  // --------------------------
  // 2) Group By Job Title & Status
  // --------------------------
  const jobMap = {};
  filteredData.forEach((candidate) => {
    const jt = candidate.jobTitle || "Unknown";
    if (!jobMap[jt]) {
      jobMap[jt] = { hired: [], archived: [] };
    }
    if (candidate.status === "Hired") {
      jobMap[jt].hired.push(candidate);
    } else if (candidate.status === "Archived") {
      jobMap[jt].archived.push(candidate);
    }
  });

  // --------------------------
  // 3) Multi-Factor Analysis for Recommendations
  // --------------------------
  const recommendations = [];

  Object.entries(jobMap).forEach(([jobTitle, group]) => {
    const { hired, archived } = group;

    // If no hired or no archived, add minimal recommendation
    if (hired.length === 0 && archived.length > 0) {
      recommendations.push({
        jobTitle,
        summary: `All candidates for "${jobTitle}" in this date range are archived. Consider reviewing your requirements or interview approach.`,
        bullets: []
      });
      return;
    }
    if (archived.length === 0 && hired.length > 0) {
      recommendations.push({
        jobTitle,
        summary: `All candidates for "${jobTitle}" in this date range are hired. The hiring process for this role seems successful.`,
        bullets: []
      });
      return;
    }
    if (hired.length === 0 && archived.length === 0) {
      // No candidates at all for this job in the date range
      return;
    }

    // We have both hired & archived
    // Gather all possible skills
    const allSkillsSet = new Set();
    [...hired, ...archived].forEach((c) => {
      if (c.scores) {
        Object.keys(c.scores).forEach((sk) => allSkillsSet.add(sk));
      }
    });
    const allSkills = Array.from(allSkillsSet);

    // Compute average skill for each group
    const hiredSkillAverages = {};
    const archivedSkillAverages = {};

    allSkills.forEach((skill) => {
      let totalH = 0, countH = 0;
      let totalA = 0, countA = 0;

      hired.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          totalH += c.scores[skill];
          countH++;
        }
      });

      archived.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          totalA += c.scores[skill];
          countA++;
        }
      });

      hiredSkillAverages[skill] = countH > 0 ? (totalH / countH) : 0;
      archivedSkillAverages[skill] = countA > 0 ? (totalA / countA) : 0;
    });

    // Identify biggest skill gaps
    let skillGaps = allSkills.map((skill) => {
      const hiredAvg = hiredSkillAverages[skill];
      const archAvg = archivedSkillAverages[skill];
      const gap = hiredAvg - archAvg; // positive => hired > archived
      return { skill, gap, hiredAvg, archAvg };
    });

    // Sort by gap descending
    skillGaps.sort((a, b) => b.gap - a.gap);

    // We'll pick top 2 largest gaps for demonstration
    const topGaps = skillGaps.slice(0, 2).filter((g) => g.gap > 0.5); // threshold for a "meaningful" gap

    // Role-specific weighting example:
    // If it's a "Backend Developer", weigh "technicalSkills" or "problemSolving" more heavily
    // (In this example, we just conceptually mention it. You could add logic to reorder skillGaps.)
    // If jobTitle.includes('Backend'), etc.

    // Build recommendation bullets
    let bullets = [];
    if (topGaps.length > 0) {
      topGaps.forEach((g) => {
        const skillName = formatSkillName(g.skill);
        bullets.push(
          `The hired candidates averaged ${g.hiredAvg.toFixed(1)} in ${skillName}, while archived averaged ${g.archAvg.toFixed(1)}. Enhancing ${skillName} could improve candidate success.`
        );
      });
    }

    // Role-specific suggestions
    if (roleSuggestions[jobTitle]) {
      bullets.push(
        `Recommended Topics for ${jobTitle}: ${roleSuggestions[jobTitle].recommendedTopics.join(
          ", "
        )}.`
      );
      bullets.push(
        `Key Soft Skills: ${roleSuggestions[jobTitle].topSoftSkills.join(", ")}.`
      );
    }

    // Example advanced logic hook for AI/NLP
    // E.g. if you had transcripts, you could use an NLP model to see if archived
    // candidates struggled to discuss certain topics. Here we just insert a placeholder
    // bullet to demonstrate the idea.
    bullets.push(
      `Consider analyzing transcripts more deeply for recurring patterns or questions where archived candidates underperformed.`
    );

    // Summarize
    let summary = `For "${jobTitle}" within the selected date range, we see ${hired.length} hired and ${archived.length} archived candidates.`;

    recommendations.push({
      jobTitle,
      summary,
      bullets
    });
  });

  // --------------------------
  // 4) Render UI
  // --------------------------
  return (
    <div className="recommendations-page">
      <h1>Recommendations</h1>
      <p className="intro-text">
        These suggestions are derived from comparing archived vs. hired candidates for each job
        title, factoring in date range and role-specific considerations.
      </p>

      {/* Live Filters */}
      <div className="recommendation-filters">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Job Title:
          <input
            type="text"
            placeholder="Frontend Developer..."
            value={filterJobTitle}
            onChange={(e) => setFilterJobTitle(e.target.value)}
          />
        </label>
      </div>

      {/* Render Recommendations */}
      {recommendations.length === 0 ? (
        <p>No recommendations found for the given filters.</p>
      ) : (
        recommendations.map((rec, idx) => (
          <div className="recommendation-card" key={idx}>
            <h2>{rec.jobTitle}</h2>
            <p>{rec.summary}</p>
            {rec.bullets && rec.bullets.length > 0 && (
              <ul>
                {rec.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Recommendations;
