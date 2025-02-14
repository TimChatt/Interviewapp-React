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
    const fetchDepartmentFrameworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=${department}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        const departmentFrameworks = data.frameworks.filter(
          (framework) => framework.department.toLowerCase() === department.toLowerCase()
        );

        // Map the job titles for the selected department
        const jobTitlesData = departmentFrameworks.map((framework) => ({
          jobTitle: framework.job_title,
          competencies: framework.competencies
        }));

        setJobTitles(jobTitlesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching department frameworks:", err);
        setError("Failed to fetch frameworks for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentFrameworks();
  }, [department]);

  const handleJobTitleClick = (jobTitle) => {
    navigate(`/frameworks/${department}/${jobTitle}`); // Navigate to the detailed job title page
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
              <h3>{job.jobTitle}</h3>
              <button onClick={() => handleJobTitleClick(job.jobTitle)}>View Details</button>
              <button onClick={() => handleEdit(job.jobTitle)}>Edit Framework</button>
              {/* You can display competencies or additional data here */}
              <div className="competencies-list">
                {job.competencies && job.competencies.map((competency, idx) => (
                  <div key={idx} className="competency-item">
                    <p><strong>{competency.name}</strong></p>
                    <ul>
                      {Object.entries(competency.descriptions || {}).map(([level, description]) => (
                        <li key={level}>{level}: {description}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFrameworks;
