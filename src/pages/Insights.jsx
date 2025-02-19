// src/pages/Insights.jsx
import React, { useState } from "react";
import '../styles.css';
import ashbyMockData from "../mockdata/ashbyMockData.json";

// Recharts components
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
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// Helper to parse date
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

function Insights() {
  // -----------------------------
  // 1) Date Filtering State
  // -----------------------------
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Convert user input (YYYY-MM-DD or similar) to JS Date objects
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  // -----------------------------
  // 2) Filter the Mock Data By Date
  // -----------------------------
  const filteredData = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false; // or true, depending on your preference

    // If a start date is set, the interview must be >= start date
    if (startDateObj && interviewDT < startDateObj) {
      return false;
    }
    // If an end date is set, the interview must be <= end date
    if (endDateObj && interviewDT > endDateObj) {
      return false;
    }
    return true;
  });

  // -----------------------------
  // Basic Counts (Hired vs. Archived) from filtered data
  // -----------------------------
  const totalCandidates = filteredData.length;
  const hiredCandidates = filteredData.filter((c) => c.status === "Hired");
  const archivedCandidates = filteredData.filter((c) => c.status === "Archived");

  const hiredCount = hiredCandidates.length;
  const archivedCount = archivedCandidates.length;

  // -----------------------------
  // 3) Pie Data: Hired vs. Archived
  // -----------------------------
  const statusPieData = [
    { name: "Hired", value: hiredCount },
    { name: "Archived", value: archivedCount }
  ];

  // -----------------------------
  // 4) Average Scores by Skill
  // -----------------------------
  const allSkillsSet = new Set();
  filteredData.forEach((candidate) => {
    if (candidate.scores) {
      Object.keys(candidate.scores).forEach((skill) => allSkillsSet.add(skill));
    }
  });
  const allSkills = Array.from(allSkillsSet);

  // Compute average for each skill
  const skillAverages = allSkills.map((skill) => {
    let totalScore = 0;
    let count = 0;
    filteredData.forEach((candidate) => {
      if (candidate.scores && candidate.scores[skill] !== undefined) {
        totalScore += candidate.scores[skill];
        count++;
      }
    });
    const avg = count > 0 ? totalScore / count : 0;
    return { skill, averageScore: parseFloat(avg.toFixed(2)) };
  });

  // -----------------------------
  // 5) Interviews Over Time (Line Chart)
  // Group interviews by "YYYY-MM" from interviewDate
  // -----------------------------
  const monthlyCountMap = {};
  filteredData.forEach((candidate) => {
    const dt = parseDate(candidate.interviewDate);
    if (dt) {
      // e.g. "2025-02"
      const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      monthlyCountMap[monthKey] = (monthlyCountMap[monthKey] || 0) + 1;
    }
  });
  // Convert map to array sorted by monthKey
  const monthlyData = Object.entries(monthlyCountMap)
    .sort(([aKey], [bKey]) => (aKey < bKey ? -1 : 1))
    .map(([month, count]) => ({ month, count }));

  // -----------------------------
  // 6) Grouped Bar: Compare Average Skill Scores by Job Title
  // We'll gather each jobTitle's average for each skill
  // Data format for a grouped bar: [ { jobTitle:'Frontend', technicalSkills:3.5, communication:4,... }, ...]
  // -----------------------------
  // 6a) First gather jobTitles
  const jobTitleMap = {};
  filteredData.forEach((candidate) => {
    const jt = candidate.jobTitle || "Unknown";
    if (!jobTitleMap[jt]) {
      jobTitleMap[jt] = {
        jobTitle: jt,
        counts: {},
        totals: {}
      };
    }
    // For each skill, accumulate
    if (candidate.scores) {
      for (let skill of Object.keys(candidate.scores)) {
        jobTitleMap[jt].totals[skill] =
          (jobTitleMap[jt].totals[skill] || 0) + candidate.scores[skill];
        jobTitleMap[jt].counts[skill] = (jobTitleMap[jt].counts[skill] || 0) + 1;
      }
    }
  });

  // 6b) Build final array
  const jobTitleData = Object.values(jobTitleMap).map((jtRecord) => {
    const row = { jobTitle: jtRecord.jobTitle };
    // For each skill in allSkills, compute average
    allSkills.forEach((skill) => {
      const total = jtRecord.totals[skill] || 0;
      const count = jtRecord.counts[skill] || 0;
      row[skill] = count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
    });
    return row;
  });

  // 7) Colors for different skills in grouped bar
  const skillColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f7f",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57"
  ];
  // If you have more skills than colors, can cycle with modulo

  return (
    <div className="insights-page">
      <h1>Insights Dashboard</h1>

      {/* Date Range Controls */}
      <div className="date-filter-controls">
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
      </div>

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

      {/* PieChart: Hired vs. Archived */}
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
                label
              >
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

      {/* BarChart: Average Scores by Skill */}
      <div className="chart-section">
        <h2>Average Scores by Skill (All Filtered Candidates)</h2>
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

      {/* LineChart: Interviews Over Time */}
      <div className="chart-section">
        <h2>Interviews Over Time (Per Month)</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Interviews"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Bar: Compare Average Scores by Job Title */}
      <div className="chart-section">
        <h2>Average Scores by Job Title</h2>
        <p>(Filtered by date range)</p>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobTitleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jobTitle" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              {allSkills.map((skill, index) => (
                <Bar
                  key={skill}
                  dataKey={skill}
                  fill={skillColors[index % skillColors.length]}
                  name={skill}
                  stackId={undefined} 
                  // Remove "stackId" if you want them side-by-side (grouped)
                  // or put them in the same stackId to get a stacked bar
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Insights;
