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
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
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

  const handleJobTitleClick = (jobTitle) => {
    const jobLevel = jobTitle ? jobTitle.split(' ').pop() : "L1"; // Default to "L1" if jobTitle is not available
    navigate(`/frameworks/${department}/${jobTitle}/${jobLevel}`);
  };

  const handleEdit = (jobTitle) => {
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
            <div key={index} className="job-title-container">
              <h3>{job.job_title}</h3>
              <div className="job-levels">
                {/* Check if job_levels exists and is a string before using split */}
                {job.job_levels && typeof job.job_levels === "string" && job.job_levels.split(',').map((level, idx) => (
                  <div key={idx} className="job-level-card">
                    <button onClick={() => handleJobTitleClick(job.job_title, level)}>
                      {level}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => handleEdit(job.job_title)}>Edit Framework</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFrameworks;
