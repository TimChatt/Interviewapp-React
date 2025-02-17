import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./JobTitleDetails.css";

const JobTitleDetails = () => {
  const { department, jobTitle } = useParams(); // Extract department and job title from the URL params
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching job details for", department, jobTitle); // Log params
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-title-details/${department}/${jobTitle}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched job details:", data); // Log fetched data
        setJobDetails(data); // Set the job details for the selected job title
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

      {jobDetails ? (
        <div className="job-details-content">
          <h2>Job Title: {jobTitle}</h2>
          <h3>Job Levels</h3>
          <ul>
            {jobDetails.job_titles && jobDetails.job_titles.length > 0 ? (
              jobDetails.job_titles.map((title, index) => (
                <li key={index}>{title.job_title}</li>
              ))
            ) : (
              <p>No job titles found for this department.</p>
            )}
          </ul>
        </div>
      ) : (
        <div>No job details found.</div>
      )}
    </div>
  );
};

export default JobTitleDetails;
