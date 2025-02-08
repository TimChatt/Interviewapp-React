import React, { useState } from "react";
import InsightsChart from "../components/InsightsChart";
import "./Insights.css"; // For styling the Insights page

// Mock data
const mockTrendData = [
  { date: "2025-01-01", score: 4, ai_predicted_score: 4.2 },
  { date: "2025-01-02", score: 3.5, ai_predicted_score: 3.7 },
  { date: "2025-01-03", score: 4.8, ai_predicted_score: 4.5 },
  { date: "2025-01-04", score: 4.2, ai_predicted_score: 4.1 },
  { date: "2025-01-05", score: 3.9, ai_predicted_score: 4.0 },
];

const mockDiscrepancyData = [
  { category: "Technical", score: 4, ai_predicted_score: 4.5 },
  { category: "Communication", score: 3, ai_predicted_score: 4 },
  { category: "Leadership", score: 4.5, ai_predicted_score: 4.3 },
  { category: "Teamwork", score: 3.5, ai_predicted_score: 3.8 },
];

const Insights = () => {
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState(0.5);

  // Filter discrepancies
  const filteredDiscrepancyData = mockDiscrepancyData.filter(
    (item) => Math.abs(item.score - item.ai_predicted_score) >= discrepancyThreshold
  );

  return (
    <div className="insights-page">
      <h1>Insights & Analysis</h1>

      {/* Trends & Patterns */}
      <div className="insights-section">
        <h2>📈 Trends & Patterns</h2>
        <InsightsChart
          data={mockTrendData}
          xKey="date"
          yKeys={["score", "ai_predicted_score"]}
          title="Score Trends vs AI Predicted Scores"
        />
      </div>

      {/* Discrepancies in Scoring */}
      <div className="insights-section">
        <h2>🔍 Discrepancies in Scoring</h2>
        <div className="discrepancy-controls">
          <label htmlFor="threshold">Discrepancy Threshold:</label>
          <input
            id="threshold"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={discrepancyThreshold}
            onChange={(e) => setDiscrepancyThreshold(parseFloat(e.target.value))}
          />
          <span>{discrepancyThreshold}</span>
        </div>
        <InsightsChart
          data={filteredDiscrepancyData}
          xKey="category"
          yKeys={["score", "ai_predicted_score"]}
          title="AI vs Actual Scores by Category"
        />
      </div>
    </div>
  );
};

export default Insights;

