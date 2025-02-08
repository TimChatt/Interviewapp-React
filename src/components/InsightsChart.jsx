import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const Insights = () => {
  const [consistencyData, setConsistencyData] = useState([]);
  const [aiComparisonData, setAiComparisonData] = useState([]);
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#ff8042"]; // For pie chart

  useEffect(() => {
    // Mock API call to fetch consistency and AI vs Human score data
    fetch("/api/consistency")
      .then((response) => response.json())
      .then((data) => {
        setConsistencyData(data.consistencyData); // Weighting across competencies
        setAiComparisonData(data.aiComparisonData); // AI vs Human comparisons
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Insights - Score Consistency</h1>

      {/* Section 1: Weighting Analysis */}
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

      {/* Section 2: AI vs Human Score Comparisons */}
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
