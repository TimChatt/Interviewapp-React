// src/pages/Recommendations.jsx
import React, { useState, useEffect } from "react";
import '../styles.css';
import ashbyMockData from "../mockdata/ashbyMockData.json";

/**
 * Helper to parse a date string. Returns a Date object or null.
 */
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Convert "technicalSkills" -> "Technical Skills", etc.
 */
function formatSkillName(skillKey) {
  return skillKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Example role-specific suggestions:
 */
const roleSuggestions = {
  "Frontend Developer": {
    recommendedTopics: [
      "React Hooks best practices and performance optimization",
      "State management patterns (Redux, Zustand, etc.)"
    ],
    topSoftSkills: [
      "Communication with cross-functional teams",
      "Adaptability to design changes"
    ],
    skillWeights: {
      technicalSkills: 1.0,
      communication: 0.8,
      problemSolving: 0.9,
      teamFit: 0.7,
      adaptability: 0.8
    }
  },
  "Backend Developer": {
    recommendedTopics: [
      "Database indexing and optimization",
      "Microservices architecture",
      "API versioning and documentation"
    ],
    topSoftSkills: [
      "Communicating complex technical topics",
      "System design trade-offs"
    ],
    skillWeights: {
      technicalSkills: 1.0,
      communication: 0.6,
      problemSolving: 0.9,
      teamFit: 0.8,
      adaptability: 0.7
    }
  }
};

function Recommendations() {
  // -----------------------------
  // 1) Local Storage & Filter State
  // -----------------------------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  useEffect(() => {
    // On mount, load from localStorage
    const storedStart = localStorage.getItem("recStartDate");
    const storedEnd = localStorage.getItem("recEndDate");
    const storedJob = localStorage.getItem("recJobTitle");

    if (storedStart) setStartDate(storedStart);
    if (storedEnd) setEndDate(storedEnd);
    if (storedJob) setFilterJobTitle(storedJob);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever filters change
    localStorage.setItem("recStartDate", startDate);
    localStorage.setItem("recEndDate", endDate);
    localStorage.setItem("recJobTitle", filterJobTitle);
  }, [startDate, endDate, filterJobTitle]);

  // -----------------------------
  // 2) Build a Job Title Dropdown
  // -----------------------------
  // Gather distinct job titles from the mock data
  const distinctJobTitles = Array.from(
    new Set(ashbyMockData.map((c) => c.jobTitle || "Unknown"))
  ).sort();

  // -----------------------------
  // 3) Filter the Data by Date Range & Job Title
  // -----------------------------
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  const dateFiltered = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false;
    if (startDateObj && interviewDT < startDateObj) return false;
    if (endDateObj && interviewDT > endDateObj) return false;
    return true;
  });

  // If user selected a job title (not ""), filter to that
  const filteredData = filterJobTitle
    ? dateFiltered.filter((c) => (c.jobTitle || "Unknown") === filterJobTitle)
    : dateFiltered;

  // -----------------------------
  // 4) Group By Job Title & Status
  // -----------------------------
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

  // -----------------------------
  // 5) Weighted Skill Analysis
  // -----------------------------
  const recommendations = [];

  Object.entries(jobMap).forEach(([jobTitle, group]) => {
    const { hired, archived } = group;
    // If none hired or none archived, produce minimal recommendation
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

    // Gather all possible skills
    const allSkillsSet = new Set();
    [...hired, ...archived].forEach((c) => {
      if (c.scores) {
        Object.keys(c.scores).forEach((sk) => allSkillsSet.add(sk));
      }
    });

    // Determine if there's a weighting object for this job
    const jobWeights = roleSuggestions[jobTitle]?.skillWeights || {};

    // We'll store average skill for hired & archived
    let skillGaps = [];

    allSkillsSet.forEach((skill) => {
      // Weighted logic: If jobWeights[skill] is present, multiply the final gap by that
      // e.g., if "technicalSkills" has weight 1.0 but "communication" has 0.8, we scale accordingly
      const weight = jobWeights[skill] || 1;

      // Compute average for hired & archived
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

      const hiredAvg = countH > 0 ? (totalH / countH) : 0;
      const archAvg = countA > 0 ? (totalA / countA) : 0;
      const gapRaw = hiredAvg - archAvg; // how much higher hired is than archived
      const gapWeighted = gapRaw * weight;

      skillGaps.push({ skill, hiredAvg, archAvg, gapRaw, gapWeighted });
    });

    // Sort skillGaps by gapWeighted descending
    skillGaps.sort((a, b) => b.gapWeighted - a.gapWeighted);

    // Pick top 2 "meaningful" gaps
    const topGaps = skillGaps.slice(0, 2).filter((g) => g.gapRaw > 0.5);

    // Build a summary
    const summary = `For "${jobTitle}" in this date range, there are ${hired.length} hired and ${archived.length} archived candidates.`;

    // Build bullets
    let bullets = [];
    topGaps.forEach((g) => {
      const skillName = formatSkillName(g.skill);
      bullets.push(
        `Hired candidates are higher in ${skillName} (avg ${g.hiredAvg.toFixed(1)}) than archived (avg ${g.archAvg.toFixed(1)}). Weighted gap: ${(g.gapWeighted).toFixed(2)}.`
      );
    });

    // Role-specific suggestions
    if (roleSuggestions[jobTitle]) {
      bullets.push(
        `Recommended Topics: ${roleSuggestions[jobTitle].recommendedTopics.join(", ")}`
      );
      bullets.push(
        `Key Soft Skills: ${roleSuggestions[jobTitle].topSoftSkills.join(", ")}`
      );
    }

    // Final
    recommendations.push({
      jobTitle,
      summary,
      bullets
    });
  });

  return (
    <div className="recommendations-page">
      <h1>Recommendations</h1>
      <p className="intro-text">
        These suggestions incorporate a weighted skill gap analysis, date/job filters, and
        role-specific advice.
      </p>

      {/* Filter Controls (Date Range & Job Title Dropdown) */}
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
          <select
            value={filterJobTitle}
            onChange={(e) => setFilterJobTitle(e.target.value)}
          >
            <option value="">(All Titles)</option>
            {distinctJobTitles.map((jt) => (
              <option key={jt} value={jt}>
                {jt}
              </option>
            ))}
          </select>
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
