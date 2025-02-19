import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import '../styles.css';

const CompetencyFramework = () => {
  const [framework, setFramework] = useState({
    department: "",
    jobTitle: "",
    jobLevels: [],
    competencies: [],
  });
  const [jobLevelInput, setJobLevelInput] = useState("");
  const [competencyInput, setCompetencyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // For showing success messages
  const navigate = useNavigate();

  // Add individual job levels
  const addJobLevel = () => {
    if (jobLevelInput.trim()) {
      setFramework((prev) => ({
        ...prev,
        jobLevels: [...prev.jobLevels, jobLevelInput.trim()],
      }));
      setJobLevelInput("");
    }
  };

  // Add individual competencies
  const addCompetency = () => {
    if (competencyInput.trim()) {
      setFramework((prev) => ({
        ...prev,
        competencies: [
          ...prev.competencies,
          { name: competencyInput.trim(), descriptions: {} },
        ],
      }));
      setCompetencyInput("");
    }
  };

  // Generate descriptions using the backend
  const autoGenerateDescriptions = async () => {
    setError(null);

    if (
      !framework.department ||
      !framework.jobTitle ||
      !framework.jobLevels.length ||
      !framework.competencies.length
    ) {
      setError("Please fill in all fields and add at least one job level and competency.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/generate-competencies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department: framework.department,
            jobTitle: framework.jobTitle,
            jobLevels: framework.jobLevels,
            competencies: framework.competencies.map((c) => c.name),
          }),
        }
      );

      if (!response.ok) {
        setError(`Error: ${response.status} - ${response.statusText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Debugging log to verify API response
      console.log("API Response:", data);

      if (data.success) {
        // Update the framework state with the generated descriptions
        const updatedCompetencies = framework.competencies.map((competency, index) => ({
          ...competency,
          descriptions: data.competencyDescriptions[index]?.levels || {},
        }));

        setFramework((prev) => ({
          ...prev,
          competencies: updatedCompetencies,
        }));

        setError(null); // Clear any existing errors
      } else {
        setError("Failed to generate competency descriptions.");
      }
    } catch (err) {
      console.error("Error generating descriptions:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save competency framework to backend
  const saveCompetencies = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Create the job titles array from the current framework
    const jobTitles = framework.jobLevels.map((jobLevel, index) => ({
      job_title: `${framework.jobTitle} ${jobLevel}`, // Combine jobTitle and jobLevel
      job_levels: [jobLevel], // Currently, each job level is handled separately, but you can add more levels if needed
      competencies: framework.competencies.map((competency) => ({
        name: competency.name,
        descriptions: competency.descriptions
      }))
    }));

    const requestBody = {
      department: framework.department,
      jobTitles: jobTitles
    };

    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/save-competencies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        setError(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSuccess("Competency framework saved successfully!");
      } else {
        setError("Failed to save competency framework.");
      }
    } catch (err) {
      console.error("Error saving framework:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-container">
      <h1 className="planner-title">Competency Framework Generator</h1>

      {/* Form Inputs */}
      <div className="planner-form">
        <input
          type="text"
          placeholder="Department"
          value={framework.department}
          onChange={(e) =>
            setFramework((prev) => ({ ...prev, department: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Job Title"
          value={framework.jobTitle}
          onChange={(e) =>
            setFramework((prev) => ({ ...prev, jobTitle: e.target.value }))
          }
        />

        {/* Job Levels Section */}
        <div className="input-group">
          <h3>Job Levels</h3>
          <div className="input-row">
            <input
              type="text"
              placeholder="Add a job level"
              value={jobLevelInput}
              onChange={(e) => setJobLevelInput(e.target.value)}
            />
            <button onClick={addJobLevel} className="add-button">
              Add
            </button>
          </div>
          <ul className="job-level-list">
            {framework.jobLevels.map((level, index) => (
              <li key={index} className="job-level-item">
                {level}
              </li>
            ))}
          </ul>
        </div>

        {/* Competencies Section */}
        <div className="input-group">
          <h3>Competencies</h3>
          <div className="input-row">
            <input
              type="text"
              placeholder="Add a competency"
              value={competencyInput}
              onChange={(e) => setCompetencyInput(e.target.value)}
            />
            <button onClick={addCompetency} className="add-button">
              Add
            </button>
          </div>
          <ul className="competencies-list">
            {framework.competencies.map((competency, index) => (
              <li key={index} className="competency-item">
                <strong>{competency.name}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Generate and Save Buttons */}
      <button
        onClick={autoGenerateDescriptions}
        disabled={loading || !framework.department || !framework.jobTitle}
        className="generate-button"
      >
        {loading ? "Generating..." : "Generate Descriptions"}
      </button>
      <button
        onClick={saveCompetencies}
        disabled={loading || !framework.competencies.length}
        className="save-button"
      >
        {loading ? "Saving..." : "Save Framework"}
      </button>
      <button
        onClick={() => navigate("/frameworks")}
        className="view-frameworks-button"
      >
        View Frameworks
      </button>

      {/* Error or Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {loading && <div className="spinner">Loading...</div>}

      {/* Display Generated Descriptions */}
      <div className="result-section">
        <h2 className="result-title">Generated Competency Descriptions</h2>
        {framework.competencies.map((competency, index) => (
          <div className="competency-card" key={index}>
            <h3 className="competency-title">{competency.name}</h3>
            <div className="competency-levels">
              {Object.entries(competency.descriptions).map(([level, description]) => (
                <div key={level} className="competency-level">
                  <strong>{level}:</strong> <span>{description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyFramework;
