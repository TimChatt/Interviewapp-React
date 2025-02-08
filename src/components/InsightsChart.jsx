import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./InsightsChart.css";

const InsightsChart = ({ data, xKey, yKeys, title }) => {
  const [chartType, setChartType] = useState("line"); // Default chart type: line
  const [selectedYKeys, setSelectedYKeys] = useState(yKeys); // Track selected Y-axis metrics

  // Toggle Y-axis metrics
  const handleToggleMetric = (metric) => {
    if (selectedYKeys.includes(metric)) {
      setSelectedYKeys(selectedYKeys.filter((key) => key !== metric));
    } else {
      setSelectedYKeys([...selectedYKeys, metric]);
    }
  };

  return (
    <div className="insights-chart">
      <h3>{title}</h3>

      {/* Chart Type Selector */}
      <div className="chart-controls">
        <button
          className={chartType === "line" ? "active" : ""}
          onClick={() => setChartType("line")}
        >
          Line Chart
        </button>
        <button
          className={chartType === "bar" ? "active" : ""}
          onClick={() => setChartType("bar")}
        >
          Bar Chart
        </button>
      </div>

      {/* Metric Selector */}
      <div className="metric-filters">
        {yKeys.map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={selectedYKeys.includes(key)}
              onChange={() => handleToggleMetric(key)}
            />
            {key}
          </label>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedYKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={["#8884d8", "#82ca9d", "#ffc658"][index % 3]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedYKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default InsightsChart;
