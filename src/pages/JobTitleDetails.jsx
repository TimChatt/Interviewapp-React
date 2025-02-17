import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./JobTitleDetails.css";

const JobTitleDetails = () => {
  const { department, jobTitle, jobLevel } = useParams(); // Extract department, job title, and job level from the URL params
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-title-details/${department}/${jobTitle}/${jobLevel}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        setJobDetails(data); // Set the job details for the selected job title and level
        setError(null);
      } catch (err) {
        console.error("Error fetching job title details:", err);
        setError("Failed to fetch job title details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [department, jobTitle, jobLevel]);

  return (
    <div className="job-title-details-container">
      <h1>{department} - {jobTitle} - {jobLevel} Framework</h1>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {jobDetails && (
        <div className="job-details-content">
          <h2>Job Level: {jobLevel}</h2>
          <h3>Competencies</h3>
          <ul>
            {jobDetails.competencies.map((competency, index) => (
              <li key={index}>
                <strong>{competency.name}</strong>
                <ul>
                  {Object.entries(competency.descriptions).map(([level, description], idx) => (
                    <li key={idx}><strong>{level}:</strong> {description}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobTitleDetails;
