import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const Insights = () => {
  const [consistencyData, setConsistencyData] = useState([]);
  const [aiComparisonData, setAiComparisonData] = useState([]);
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#ff8042"]; // Colors for Pie Chart

  // Fetch data from the backend when the component loads
  useEffect(() => {
    fetch("https://interviewappbe-production.up.railway.app") // Replace with your backend URL
      .then((response) => response.json())
      .then((data) => {
        setConsistencyData(data.consistencyData); // Set consistency data for the bar chart
        setAiComparisonData(data.aiComparisonData); // Set AI vs human scoring data for the pie chart
      })
      .catch((error) => console.error("Error fetching insights data:", error));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Insights - Score Consistency</h1>

      {/* Section 1: Weighting Across Competencies */}
      <div>
        <h2>Weighting Across Competencies</h2>
        <BarChart width={800} height={400} data={consistencyData}>
          <XAxis dataKey="competency" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="weighting" fill="#82ca9d" />
        </BarChart>
      </div>

      {/* Section 2: AI vs Human Scoring */}
      <div>
        <h2>AI vs Human Scoring</h2>
        <PieChart width={400} height={400}>
          <Pie
            data={aiComparisonData}
            dataKey="score"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {aiComparisonData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
};

export default Insights;

