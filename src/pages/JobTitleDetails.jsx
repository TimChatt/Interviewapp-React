import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const JobTitleDetails = () => {
  const { department, jobTitle } = useParams(); // Extract department and jobTitle from the URL params
  const [framework, setFramework] = useState(null); // State to store the selected framework
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchFramework = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=${jobTitle}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Find the specific framework for the department and job title
        const selectedFramework = data.frameworks.find(
          (fw) =>
            fw.department.toLowerCase() === department.toLowerCase() &&
            fw.job_title.toLowerCase() === jobTitle.toLowerCase()
        );

        if (!selectedFramework) {
          throw new Error("Framework not found for the selected job title.");
        }

        setFramework(selectedFramework); // Set the selected framework
        setError(null); // Clear any existing errors
      } catch (error) {
        console.error("Error fetching framework:", error);
        setError(error.message || "Failed to fetch framework details.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchFramework();
  }, [department, jobTitle]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!framework) {
    return (
      <div className="no-framework-message">
        No framework details available for this job title.
      </div>
    );
  }

  return (
    <div className="job-title-details">
      <h1>{framework.job_title}</h1>
      <h2>Department: {framework.department}</h2>
      <h2>Competencies:</h2>

      {framework.competencies.length > 0 ? (
        framework.competencies.map((competency, index) => (
          <div key={index} className="competency-card">
            <h3>{competency.name}</h3>
            {Object.entries(competency.descriptions || {}).map(([level, description]) => (
              <div key={level}>
                <strong>{level}:</strong> {description}
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="no-competencies-message">
          No competencies have been defined for this job title.
        </div>
      )}
    </div>
  );
};

export default JobTitleDetails;

