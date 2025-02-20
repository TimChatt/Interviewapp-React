import React, { useState } from "react";
import "../styles.css";
import ashbyMockData from "../mockdata/ashbyMockData.json";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  const filteredData = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false;
    if (startDateObj && interviewDT < startDateObj) return false;
    if (endDateObj && interviewDT > endDateObj) return false;
    return true;
  });

  const totalCandidates = filteredData.length;
  const hiredCount = filteredData.filter((c) => c.status === "Hired").length;
  const archivedCount = filteredData.filter((c) => c.status === "Archived").length;

  const statusPieData = [
    { name: "Hired", value: hiredCount },
    { name: "Archived", value: archivedCount }
  ];

  const pieColors = ["#A0C4FF", "#FFADAD"]; // Pastel blue & red
  const lineChartColor = "#FFD700"; // Gold yellow for interviews over time

  // Interviews Over Time Calculation
  const monthlyCountMap = {};
  filteredData.forEach((candidate) => {
    const dt = parseDate(candidate.interviewDate);
    if (dt) {
      const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      monthlyCountMap[monthKey] = (monthlyCountMap[monthKey] || 0) + 1;
    }
  });

  const monthlyData = Object.entries(monthlyCountMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Average Scores by Skill
  const allSkillsSet = new Set();
  filteredData.forEach((candidate) => {
    if (candidate.scores) {
      Object.keys(candidate.scores).forEach((skill) => allSkillsSet.add(skill));
    }
  });

  const allSkills = Array.from(allSkillsSet);
  const skillColors = ["#A0C4FF", "#BDB2FF", "#FFC6FF", "#FFADAD", "#CAFFBF"];

  const skillAverages = allSkills.map((skill) => {
    let totalScore = 0;
    let count = 0;
    filteredData.forEach((candidate) => {
      if (candidate.scores && candidate.scores[skill] !== undefined) {
        totalScore += candidate.scores[skill];
        count++;
      }
    });
    return { skill, averageScore: count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0 };
  });

  return (
    <div className="insights-page">
      <h1>📊 Insights Dashboard</h1>

      {/* Date Filters */}
      <div className="date-filter-controls">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <h2>Total Candidates</h2>
          <p>{totalCandidates}</p>
        </div>
        <div className="stat-card highlight">
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
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interviews Over Time (Line Chart) */}
      <div className="chart-section">
        <h2>📅 Interviews Over Time</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke={lineChartColor} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Bar Chart for Team Fit & Other Scores */}
      <div className="chart-section">
        <h2>⭐ Team Fit & Other Scores</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={skillAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              {allSkills.map((skill, index) => (
                <Bar key={skill} dataKey="averageScore" fill={skillColors[index % skillColors.length]} name={skill} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Insights;
