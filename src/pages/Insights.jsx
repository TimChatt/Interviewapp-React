// src/pages/Insights.jsx
import React from "react";
import "./Insights.css";
import ashbyMockData from "../mockdata/ashbyMockData.json";

// Recharts imports
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Insights() {
  // 1) Process Ashby data for high-level stats
  //    a. Count Hired vs. Archived
  //    b. Average scores per skill

  const totalCandidates = ashbyMockData.length;
  const hiredCandidates = ashbyMockData.filter((c) => c.status === "Hired");
  const archivedCandidates = ashbyMockData.filter((c) => c.status === "Archived");

  const hiredCount = hiredCandidates.length;
  const archivedCount = archivedCandidates.length;

  // 2) Compute average scores (technicalSkills, communication, etc.)
  //    We'll assume all skill keys from the first candidate. Or gather from all.
  //    For demonstration, let's gather all skill keys from all candidates.
  const allSkillsSet = new Set();
  ashbyMockData.forEach((candidate) => {
    if (candidate.scores) {
      Object.keys(candidate.scores).forEach((skill) => allSkillsSet.add(skill));
    }
  });

  const allSkills = Array.from(allSkillsSet);

  // For each skill, compute average across all candidates
  const skillAverages = allSkills.map((skill) => {
    let totalScore = 0;
    let count = 0;

    ashbyMockData.forEach((candidate) => {
      if (candidate.scores && candidate.scores[skill] !== undefined) {
        totalScore += candidate.scores[skill];
        count++;
      }
    });

    const avg = count > 0 ? totalScore / count : 0;
    return {
      skill,
      averageScore: parseFloat(avg.toFixed(2))
    };
  });

  // 3) Prepare data for the PieChart (hired vs. archived)
  const statusPieData = [
    { name: "Hired", value: hiredCount },
    { name: "Archived", value: archivedCount }
  ];

  // 4) You could also do job-title-based charts or other stats here
  // For example, grouping candidates by jobTitle
  const jobTitleCounts = {};
  ashbyMockData.forEach((candidate) => {
    const job = candidate.jobTitle || "Unknown";
    jobTitleCounts[job] = (jobTitleCounts[job] || 0) + 1;
  });

  // Convert to array for easier charting or listing
  const jobTitleData = Object.entries(jobTitleCounts).map(([job, count]) => ({
    jobTitle: job,
    count
  }));

  // 5) Render the page
  return (
    <div className="insights-page">
      <h1>Insights Dashboard</h1>

      {/* Basic stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <h2>Total Candidates</h2>
          <p>{totalCandidates}</p>
        </div>
        <div className="stat-card">
          <h2>Hired</h2>
          <p>{hiredCount}</p>
        </div>
        <div className="stat-card">
          <h2>Archived</h2>
          <p>{archivedCount}</p>
        </div>
      </div>

      {/* 6) PieChart: Hired vs. Archived */}
      <div className="chart-section">
        <h2>Hired vs. Archived</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {/* Optional: Custom colors for each slice */}
                {statusPieData.map((entry, index) => {
                  const COLORS = ["#8884d8", "#82ca9d"];
                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7) BarChart: Average skill scores */}
      <div className="chart-section">
        <h2>Average Scores by Skill</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#8884d8" name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 8) Optional: Job Title distribution */}
      <div className="chart-section">
        <h2>Candidates per Job Title</h2>
        <ul>
          {jobTitleData.map((item) => (
            <li key={item.jobTitle}>
              <strong>{item.jobTitle}:</strong> {item.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Insights;
