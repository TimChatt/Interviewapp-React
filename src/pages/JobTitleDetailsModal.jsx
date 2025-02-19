import React, { useState, useEffect } from "react";
import '../styles.css';

const JobTitleDetailsModal = ({
  isOpen,
  onClose,
  department,
  jobTitle,
  jobLevel,
}) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode toggles
  const [isEditing, setIsEditing] = useState(false);
  // Editable fields
  const [editedSalaryMin, setEditedSalaryMin] = useState("");
  const [editedSalaryMax, setEditedSalaryMax] = useState("");
  const [editedCompetencies, setEditedCompetencies] = useState([]);

  // Competency editing handlers
  const handleCompetencyNameChange = (index, newName) => {
    const updated = [...editedCompetencies];
    updated[index].name = newName;
    setEditedCompetencies(updated);
  };

  const handleCompetencyDescriptionChange = (compIndex, levelKey, newDesc) => {
    const updated = [...editedCompetencies];
    updated[compIndex].descriptions[levelKey] = newDesc;
    setEditedCompetencies(updated);
  };

  // Fetch details when modal opens
  useEffect(() => {
    if (!isOpen) return;
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

        // Initialize editable fields
        setEditedSalaryMin(data.salary_min || "");
        setEditedSalaryMax(data.salary_max || "");
        setEditedCompetencies(JSON.parse(JSON.stringify(data.competencies || [])));
      } catch (err) {
        console.error("Error fetching job title details:", err);
        setError("Failed to fetch job title details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [isOpen, department, jobTitle, jobLevel]);

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  // Save changes
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
            salaryMin: Number(editedSalaryMin) || 0,
            salaryMax: Number(editedSalaryMax) || 0,
            competencies: editedCompetencies,
          }),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update job details.");
      }
      const updatedData = await response.json();
      // Update local state
      setJobDetails((prev) => ({
        ...prev,
        salary_min: updatedData.salary_min,
        salary_max: updatedData.salary_max,
        competencies: updatedData.competencies,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating job details:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Export to CSV
  const handleExportToCSV = () => {
    if (!jobDetails) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Department,Job Title,Job Level,Salary Min,Salary Max\n`;
    csvContent += `${department},${jobTitle},${jobLevel},${jobDetails.salary_min || ""},${jobDetails.salary_max || ""}\n\n`;
    csvContent += "Competency Name,Level,Description\n";
    jobDetails.competencies.forEach((comp) => {
      Object.entries(comp.descriptions).forEach(([lvl, desc]) => {
        csvContent += `${comp.name},${lvl},${desc}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${department}-${jobTitle}-${jobLevel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="job-title-details-container">
          <h1>
            {department} - {jobTitle} - {jobLevel} Framework
          </h1>
          {loading && <div className="loading-spinner">Loading...</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && jobDetails && (
            <>
              <div className="buttons-container">
                <button onClick={handleExportToCSV}>Export to CSV</button>
                {isEditing ? (
                  <button onClick={handleSave}>Save</button>
                ) : (
                  <button onClick={handleEditClick}>Edit</button>
                )}
              </div>
              <div className="job-details-content">
                <h2>Job Level: {jobLevel}</h2>
                <h3>Salary Banding</h3>
                {!isEditing ? (
                  <div className="salary-banding-section">
                    <p>
                      <strong>Min: </strong>
                      {jobDetails.salary_min ?? "N/A"}{" "}
                      <strong>Max: </strong>
                      {jobDetails.salary_max ?? "N/A"}
                    </p>
                  </div>
                ) : (
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
                )}
                <h3>Competencies</h3>
                {!isEditing ? (
                  <ul>
                    {jobDetails.competencies.map((comp, i) => (
                      <li key={i}>
                        <strong>{comp.name}</strong>
                        <ul>
                          {Object.entries(comp.descriptions).map(([lvl, desc], idx) => (
                            <li key={idx}>
                              <strong>{lvl}:</strong> {desc}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="edit-competencies-container">
                    {editedCompetencies.map((comp, compIndex) => (
                      <div key={compIndex} style={{ marginBottom: "1rem" }}>
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
                          {Object.entries(comp.descriptions).map(([lvlKey, descVal]) => (
                            <div key={lvlKey} style={{ marginTop: "0.5rem" }}>
                              <strong>{lvlKey}:</strong>{" "}
                              <input
                                type="text"
                                value={descVal}
                                onChange={(e) =>
                                  handleCompetencyDescriptionChange(compIndex, lvlKey, e.target.value)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTitleDetailsModal;
