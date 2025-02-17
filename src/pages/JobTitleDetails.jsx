import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const JobTitleDetails = () => {
  const { department, jobTitle } = useParams(); // Extract department and job title from the URL params
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-framework/${department}/${jobTitle}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        setJobDetails(data); // Set the job title details
        setError(null);
      } catch (err) {
        console.error("Error fetching job title details:", err);
        setError("Failed to fetch job title details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [department, jobTitle]);

  return (
    <div className="job-title-details-container">
      <h1>{department} - {jobTitle} Framework</h1>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {jobDetails && (
        <div className="job-details-content">
          <h2>Job Levels</h2>
          <ul>
            {jobDetails.job_levels && jobDetails.job_levels.split(",").map((level, index) => (
              <li key={index}>{level}</li>
            ))}
          </ul>

          <h2>Competencies</h2>
          <ul>
            {jobDetails.competencies && jobDetails.competencies.map((competency, index) => (
              <li key={index}>
                <strong>{competency.name}</strong>
                <ul>
                  {competency.descriptions && Object.entries(competency.descriptions).map(([level, description], idx) => (
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
