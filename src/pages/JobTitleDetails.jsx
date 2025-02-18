import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./JobTitleDetails.css";

const JobTitleDetails = () => {
  const { department, jobTitle, jobLevel } = useParams();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggles edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Local states to hold editable fields
  const [editedSalaryMin, setEditedSalaryMin] = useState("");
  const [editedSalaryMax, setEditedSalaryMax] = useState("");
  const [editedCompetencies, setEditedCompetencies] = useState([]);

  // Fetch job details
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
        setJobDetails(data);
        setError(null);

        // Initialize local editable states
        setEditedSalaryMin(data.salary_min || "");
        setEditedSalaryMax(data.salary_max || "");
        // Deep-copy or store the competencies as needed
        setEditedCompetencies(JSON.parse(JSON.stringify(data.competencies || [])));
      } catch (err) {
        console.error("Error fetching job title details:", err);
        setError("Failed to fetch job title details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [department, jobTitle, jobLevel]);

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  // Handle saving updates
  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/update-job-title-details/${department}/${jobTitle}/${jobLevel}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salaryMin: Number(editedSalaryMin) || 0, // or parse them properly
            salaryMax: Number(editedSalaryMax) || 0,
            competencies: editedCompetencies,
          }),
        }
      );

      if (!response.ok) {
        const errorResp = await response.json();
        throw new Error(errorResp.detail || "Failed to update job details");
      }

      const updatedData = await response.json();
      // Update local state with the response
      setJobDetails((prev) => ({
        ...prev,
        salary_min: updatedData.salary_min,
        salary_max: updatedData.salary_max,
        competencies: updatedData.competencies,
      }));

      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving job details:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle exporting to CSV
  const handleExportToCSV = () => {
    if (!jobDetails) return;

    // Construct CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add a header row (customize as needed)
    csvContent += `Department,Job Title,Job Level,Salary Min,Salary Max\n`;
    csvContent += `${department},${jobTitle},${jobLevel},${jobDetails.salary_min || ""},${jobDetails.salary_max || ""}\n\n`;

    // Competencies
    csvContent += `Competency Name,Level,Description\n`;
    jobDetails.competencies.forEach((comp) => {
      Object.entries(comp.descriptions).forEach(([level, description]) => {
        csvContent += `${comp.name},${level},${description}\n`;
      });
    });

    // Encode & download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${department}-${jobTitle}-${jobLevel}.csv`);
    document.body.appendChild(link); // for Firefox
    link.click();
    document.body.removeChild(link);
  };

  // If editing competencies, we need an onChange handler
  // If your data structure is more complex (levels, etc.), you'll need nested forms
  const handleCompetencyNameChange = (index, newName) => {
    const updated = [...editedCompetencies];
    updated[index].name = newName;
    setEditedCompetencies(updated);
  };

  // For nested descriptions, we could do something like this
  const handleCompetencyDescriptionChange = (compIndex, levelKey, newDesc) => {
    const updated = [...editedCompetencies];
    updated[compIndex].descriptions[levelKey] = newDesc;
    setEditedCompetencies(updated);
  };

  return (
    <div className="job-title-details-container">
      <h1>
        {department} - {jobTitle} - {jobLevel} Framework
      </h1>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Action Buttons if not loading/error */}
      {!loading && !error && jobDetails && (
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleExportToCSV}>Export to CSV</button>
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={handleEditClick}>Edit</button>
          )}
        </div>
      )}

      {jobDetails && (
        <div className="job-details-content">
          <h2>Job Level: {jobLevel}</h2>

          {/* SALARY BANDING SECTION */}
          <h3>Salary Banding</h3>
          {isEditing ? (
            <div className="salary-banding-edit">
              <label>
                Min Salary:
                <input
                  type="number"
                  value={editedSalaryMin}
                  onChange={(e) => setEditedSalaryMin(e.target.value)}
                />
              </label>
              <label>
                Max Salary:
                <input
                  type="number"
                  value={editedSalaryMax}
                  onChange={(e) => setEditedSalaryMax(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <p>
              <strong>Min: </strong>
              {jobDetails.salary_min ?? "N/A"}{" "}
              <strong>Max: </strong>
              {jobDetails.salary_max ?? "N/A"}
            </p>
          )}

          {/* COMPETENCIES SECTION */}
          <h3>Competencies</h3>
          {!isEditing ? (
            // View mode
            <ul>
              {jobDetails.competencies.map((competency, index) => (
                <li key={index}>
                  <strong>{competency.name}</strong>
                  <ul>
                    {Object.entries(competency.descriptions).map(
                      ([level, description], idx) => (
                        <li key={idx}>
                          <strong>{level}:</strong> {description}
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            // Edit mode
            <div>
              {editedCompetencies.map((comp, compIndex) => (
                <div key={compIndex} style={{ margin: "1rem 0" }}>
                  <label>
                    Competency Name:
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) =>
                        handleCompetencyNameChange(compIndex, e.target.value)
                      }
                    />
                  </label>
                  <div style={{ marginLeft: "2rem" }}>
                    {Object.entries(comp.descriptions).map(
                      ([levelKey, levelDesc]) => (
                        <div key={levelKey} style={{ marginTop: "0.5rem" }}>
                          <strong>{levelKey}:</strong>{" "}
                          <input
                            type="text"
                            value={levelDesc}
                            onChange={(e) =>
                              handleCompetencyDescriptionChange(
                                compIndex,
                                levelKey,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobTitleDetails;
