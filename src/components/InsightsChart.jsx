import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend, HeatMap } from "recharts";
import WordCloud from "react-wordcloud";

const Insights = () => {
  const [scoringTrends, setScoringTrends] = useState([]);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [consistencyData, setConsistencyData] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    // Mock API call to fetch data (replace with real API)
    fetch("/api/insights")
      .then((response) => response.json())
      .then((data) => {
        setScoringTrends(data.scoringTrends);
        setWordCloudData(data.wordCloudData);
        setConsistencyData(data.consistencyData);
        setFeedback(data.feedback);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Insights</h1>

      {/* Section 1: Scoring Trends */}
      <div>
        <h2>Scoring Trends Over Time</h2>
        <LineChart width={800} height={400} data={scoringTrends}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageScore" stroke="#8884d8" />
        </LineChart>
      </div>

      {/* Section 2: Word Cloud */}
      <div>
        <h2>Answer Analysis</h2>
        <WordCloud words={wordCloudData} options={{ fontSizes: [15, 50] }} />
      </div>

      {/* Section 3: Consistency */}
      <div>
        <h2>Score Consistency</h2>
        <BarChart width={800} height={400} data={consistencyData}>
          <XAxis dataKey="competency" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="weighting" fill="#82ca9d" />
        </BarChart>
      </div>

      {/* Section 4: Recommendations */}
      <div>
        <h2>Recommendations for Candidates</h2>
        <ul>
          {feedback.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Insights;
