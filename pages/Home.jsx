import React from "react";
import MetricsCard from "../components/MetricsCard";
import InsightsChart from "../components/InsightsChart";
import "./Home.css"; // For styling the Home page

const mockPipelineData = [
  { stage: "Applied", count: 50 },
  { stage: "Phone Screen", count: 25 },
  { stage: "Technical Interview", count: 15 },
  { stage: "HR Interview", count: 10 },
  { stage: "Offer", count: 5 },
];

const mockTrendData = [
  { date: "2025-01-01", candidates: 50 },
  { date: "2025-01-02", candidates: 40 },
  { date: "2025-01-03", candidates: 30 },
  { date: "2025-01-04", candidates: 20 },
  { date: "2025-01-05", candidates: 10 },
];

const Home = () => {
  return (
    <div className="home-page">
      <h1>Dashboard Overview</h1>

      {/* Metrics Section */}
      <div className="metrics-section">
        <MetricsCard title="Total Candidates" value="120" icon="👥" />
        <MetricsCard title="Avg Time to Hire" value="14 days" icon="⏱️" />
        <MetricsCard title="Pipeline Efficiency" value="85%" icon="📈" />
      </div>

      {/* Pipeline Data */}
      <div className="pipeline-section">
        <h2>Pipeline Overview</h2>
        <InsightsChart
          data={mockPipelineData}
          xKey="stage"
          yKeys={["count"]}
          title="Candidates at Each Stage"
        />
      </div>

      {/* Trends Section */}
      <div className="trends-section">
        <h2>Candidate Trends</h2>
        <InsightsChart
          data={mockTrendData}
          xKey="date"
          yKeys={["candidates"]}
          title="Candidates Over Time"
        />
      </div>
    </div>
  );
};

export default Home;

