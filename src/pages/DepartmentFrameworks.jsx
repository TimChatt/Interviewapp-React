import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DepartmentFrameworks.css";

const DepartmentFrameworks = () => {
  const { department } = useParams(); // Get the department name from the URL
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        // Fetch job titles related to the department
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        // Set job titles data from the response
        setJobTitles(data.job_titles || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching department job titles:", err);
        setError("Failed to fetch job titles for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentJobTitles();
  }, [department]);

  const handleJobTitleClick = (jobTitle, jobLevel) => {
    navigate(`/frameworks/${department}/${jobTitle}/${jobLevel}`);
};

  const handleEdit = (jobTitle) => {
    // Navigate to the edit page for the job title
    navigate(`/edit-framework/${jobTitle}`);
  };

  return (
    <div className="department-frameworks-container">
      <h1>{department} Frameworks</h1>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && jobTitles.length === 0 && (
        <div className="no-job-titles-message">
          <p>No job titles found for this department.</p>
        </div>
      )}

      {!loading && !error && jobTitles.length > 0 && (
        <div className="job-titles-grid">
          {jobTitles.map((job, index) => (
            <div key={index} className="job-title-card">
              <h3>{job.job_title}</h3>
              <button onClick={() => handleJobTitleClick(job.job_title)}>View Details</button>
              <button onClick={() => handleEdit(job.job_title)}>Edit Framework</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFrameworks;
