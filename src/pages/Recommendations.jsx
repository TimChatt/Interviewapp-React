// src/pages/Recommendations.jsx
import React from "react";
import "./Recommendations.css";
import ashbyMockData from "../mockdata/ashbyMockData.json";

// A helper to capitalize skill keys for nicer display
function formatSkillName(skillKey) {
  // e.g. "technicalSkills" -> "Technical Skills"
  // This is a simplistic approach. Adjust as needed.
  return skillKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function Recommendations() {
  // 1) Group Candidates by Job Title & Status
  //    We’ll create a structure like:
  //    { "Frontend Developer": { hired: [...], archived: [...] }, ... }
  const jobMap = {};
  ashbyMockData.forEach((candidate) => {
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

  // 2) For each job title, compare average scores of Hired vs. Archived
  //    We'll find the "skill gaps" where archived candidates are weaker
  //    This is a simplistic approach for demonstration.
  const recommendations = [];

  Object.entries(jobMap).forEach(([jobTitle, group]) => {
    const { hired, archived } = group;

    // If we have no hired or no archived, skip or show a minimal recommendation
    if (hired.length === 0) {
      if (archived.length > 0) {
        recommendations.push({
          jobTitle,
          summary: `All archived candidates for ${jobTitle}, none hired yet. Consider adjusting requirements or evaluating if the candidate pool is adequate.`
        });
      }
      return;
    }
    if (archived.length === 0) {
      // If there's only hired, maybe no recommendation needed
      // But let's show a quick message
      recommendations.push({
        jobTitle,
        summary: `No archived candidates for ${jobTitle}. The hiring process for this role seems to be going smoothly.`
      });
      return;
    }

    // We have both hired & archived. Let's compute average skill for each group.
    // Gather all possible skill keys.
    const allSkills = new Set();
    hired.forEach((c) => c.scores && Object.keys(c.scores).forEach((k) => allSkills.add(k)));
    archived.forEach((c) => c.scores && Object.keys(c.scores).forEach((k) => allSkills.add(k)));

    // Compute average skill for Hired
    const hiredSkillAverages = {};
    allSkills.forEach((skill) => {
      let total = 0;
      let count = 0;
      hired.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          total += c.scores[skill];
          count++;
        }
      });
      hiredSkillAverages[skill] = count > 0 ? total / count : 0;
    });

    // Compute average skill for Archived
    const archivedSkillAverages = {};
    allSkills.forEach((skill) => {
      let total = 0;
      let count = 0;
      archived.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          total += c.scores[skill];
          count++;
        }
      });
      archivedSkillAverages[skill] = count > 0 ? total / count : 0;
    });

    // Identify the largest skill gaps
    // e.g. "technicalSkills" = hired(4.5) - archived(2.3) = 2.2 => big gap
    let skillGaps = [];
    allSkills.forEach((skill) => {
      const hiredAvg = hiredSkillAverages[skill];
      const archivedAvg = archivedSkillAverages[skill];
      const gap = hiredAvg - archivedAvg; // positive => hired is higher
      skillGaps.push({ skill, gap, hiredAvg, archivedAvg });
    });

    // Sort by gap descending
    skillGaps.sort((a, b) => b.gap - a.gap);

    // We'll pick the top 1 or 2 largest gaps for a bullet list
    const topGaps = skillGaps.slice(0, 2).filter((g) => g.gap > 0.5); // threshold

    // Build a textual recommendation
    // For demonstration, we mention the top gaps
    if (topGaps.length > 0) {
      let bullets = topGaps.map((g) => {
        return `The hired candidates averaged ${g.hiredAvg.toFixed(1)} in "${formatSkillName(
          g.skill
        )}" while archived averaged ${g.archivedAvg.toFixed(1)}. Consider focusing interview questions or candidate training to improve this area.`;
      });

      recommendations.push({
        jobTitle,
        summary: `We've identified skill differences for ${jobTitle}.`,
        bullets
      });
    } else {
      // If no significant gap found
      recommendations.push({
        jobTitle,
        summary: `For ${jobTitle}, there isn't a large skill gap between hired and archived candidates. Review other factors like culture fit or communication style.`
      });
    }
  });

  return (
    <div className="recommendations-page">
      <h1>Recommendations</h1>
      <p className="intro-text">
        These suggestions are based on comparing archived vs. hired candidates for each job title
        and identifying areas of improvement or success. Use them to refine your hiring strategy,
        interview questions, or candidate feedback.
      </p>

      {recommendations.length === 0 ? (
        <p>No recommendations found.</p>
      ) : (
        recommendations.map((rec, idx) => (
          <div className="recommendation-card" key={idx}>
            <h2>{rec.jobTitle}</h2>
            <p>{rec.summary}</p>
            {rec.bullets && (
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
