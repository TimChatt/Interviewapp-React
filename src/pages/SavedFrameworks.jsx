import React, { useState, useEffect } from "react";
import "./SavedFrameworks.css";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all saved frameworks from the backend
  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://interviewappbe-production.up.railway.app/api/saved-frameworks"
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setFrameworks(data.frameworks || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching frameworks:", err);
        setError("Failed to fetch saved frameworks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  // Handle department selection
  const handleDepartmentClick = (department) => {
    if (selectedDepartment === department) {
      setSelectedDepartment(null); // Collapse if already selected
    } else {
      setSelectedDepartment(department);
      setSelectedJobTitle(null); // Reset job title when switching departments
    }
  };

  // Handle job title selection
  const handleJobTitleClick = (jobTitle) => {
    if (selectedJobTitle === jobTitle) {
      setSelectedJobTitle(null); // Collapse if already selected
    } else {
      setSelectedJobTitle(jobTitle);
    }
  };

  return (
    <div className="saved-frameworks-container">
      <h1 className="saved-frameworks-title">Saved Competency Frameworks</h1>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && frameworks.length === 0 && (
        <div className="no-frameworks-message">
          No saved frameworks found. Start by generating a new framework.
        </div>
      )}

      {!loading && !error && frameworks.length > 0 && (
        <div className="departments-list">
          {frameworks.map((framework) => (
            <div key={framework.department} className="department-container">
              <h2
                className="department-title"
                onClick={() => handleDepartmentClick(framework.department)}
              >
                {framework.department}
              </h2>

              {selectedDepartment === framework.department && (
                <div className="job-titles-list">
                  {framework.jobTitles.map((jobTitle) => (
                    <div
                      key={jobTitle.title}
                      className="job-title-container"
                    >
                      <h3
                        className="job-title"
                        onClick={() => handleJobTitleClick(jobTitle.title)}
                      >
                        {jobTitle.title}
                      </h3>

                      {selectedJobTitle === jobTitle.title && (
                        <div className="competencies-list">
                          {jobTitle.competencies.map((competency) => (
                            <div
                              key={competency.name}
                              className="competency-card"
                            >
                              <h4 className="competency-name">
                                {competency.name}
                              </h4>
                              <div className="competency-levels">
                                {Object.entries(
                                  competency.descriptions
                                ).map(([level, description]) => (
                                  <div
                                    key={level}
                                    className="competency-level"
                                  >
                                    <strong>{level}:</strong>{" "}
                                    <span>{description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedFrameworks;
