import React from "react";
import '../styles.css';

const MetricsCard = ({ title, value, icon }) => {
  return (
    <div className="metrics-card">
      <div className="metrics-card-icon">{icon}</div>
      <div className="metrics-card-content">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default MetricsCard;

