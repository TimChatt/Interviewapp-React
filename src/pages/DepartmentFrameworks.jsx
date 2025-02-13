import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./../styles.css";

const DepartmentFrameworks = () => {
  const { department } = useParams(); // Extract department from URL params
  const [frameworks, setFrameworks] = useState([]); // State to hold job titles for the department
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      try {
        // Fetch all frameworks from the backend
        const response = await fetch(
          "https://interviewappbe-production.up.railway.app/api/search-frameworks?query="
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Filter frameworks by department
        const departmentFrameworks = data.frameworks.filter(
          (fw) => fw.department.toLowerCase() === department.toLowerCase()
        );

        setFrameworks(departmentFrameworks); // Set the filtered frameworks
        setError(null); // Clear any errors
      } catch (error) {
        console.error("Error fetching frameworks:", error);
        setError("Failed to load job titles for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, [department]);

  const handleJobTitleClick = (jobTitle) => {
    // Navigate to competencies for the selected job title
    navigate(`/frameworks/${department}/${jobTitle}`);
  };

  return (
    <div className="department-frameworks">
      <h1>{department} Frameworks</h1>

      {loading && <div className="loading-spinner">Loading...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && frameworks.length === 0 && (
        <div className="no-frameworks-message">
          <p>No job titles found for this department.</p>
        </div>
      )}

      {!loading && !error && frameworks.length > 0 && (
        <div className="frameworks-list">
          {frameworks.map((framework, index) => (
            <div
              key={index}
              className="job-title-container"
              onClick={() => handleJobTitleClick(framework.job_title)}
            >
              <h2>{framework.job_title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFrameworks;
