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

  const pastelColors = ["#A0C4FF", "#FFADAD", "#FFD6A5", "#FDFFB6", "#9BF6FF", "#BDB2FF"];

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
                labelLine
                label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const x = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
                  const y = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#333"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize="14px"
                      fontWeight="bold"
                    >
                      {name}: {value}
                    </text>
                  );
                }}
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pastelColors[index % pastelColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart: Average Scores by Skill */}
      <div className="chart-section">
        <h2>Average Scores by Skill</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={statusPieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={pastelColors[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LineChart: Interviews Over Time (Restored) */}
      <div className="chart-section">
        <h2>Interviews Over Time</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={pastelColors[2]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Insights;
