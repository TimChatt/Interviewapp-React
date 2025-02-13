import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditFramework.css";

const EditFramework = () => {
  const { id } = useParams(); // Get framework ID from the URL
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null); // Store framework details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch framework details by ID
  useEffect(() => {
    const fetchFramework = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-framework/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setFramework(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching framework:", err);
        setError("Failed to fetch framework. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFramework((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle competencies changes
  const handleCompetenciesChange = (index, field, value) => {
    const updatedCompetencies = [...framework.competencies];
    updatedCompetencies[index][field] = value;
    setFramework((prev) => ({
      ...prev,
      competencies: updatedCompetencies,
    }));
  };

  // Add a new competency
  const addCompetency = () => {
    setFramework((prev) => ({
      ...prev,
      competencies: [
        ...prev.competencies,
        { name: "", levels: {} },
      ],
    }));
  };

  // Save the updated framework
  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/update-framework/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(framework),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update framework.");
      }

      alert("Framework updated successfully!");
      navigate("/saved-frameworks"); // Redirect to the saved frameworks page
    } catch (err) {
      console.error("Error saving framework:", err);
      alert("An error occurred while saving the framework.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!framework) return null; // Avoid rendering before framework is fetched

  return (
    <div className="edit-framework-container">
      <h1 className="edit-framework-title">Edit Framework</h1>

      <div className="form-group">
        <label>Department</label>
        <input
          type="text"
          name="department"
          value={framework.department}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Job Title</label>
        <input
          type="text"
          name="job_title"
          value={framework.job_title}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Job Levels (comma-separated)</label>
        <input
          type="text"
          name="job_levels"
          value={framework.job_levels}
          onChange={handleChange}
        />
      </div>

      <div className="competencies-container">
        <h2>Competencies</h2>
        {framework.competencies.map((competency, index) => (
          <div key={index} className="competency-item">
            <input
              type="text"
              placeholder="Competency Name"
              value={competency.name}
              onChange={(e) =>
                handleCompetenciesChange(index, "name", e.target.value)
              }
            />
            <textarea
              placeholder="Competency Levels (e.g., Level 1: ..., Level 2: ...)"
              value={JSON.stringify(competency.levels, null, 2)}
              onChange={(e) =>
                handleCompetenciesChange(index, "levels", JSON.parse(e.target.value))
              }
            />
          </div>
        ))}
        <button className="add-competency-button" onClick={addCompetency}>
          Add Competency
        </button>
      </div>

      <div className="actions">
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <button
          className="cancel-button"
          onClick={() => navigate("/saved-frameworks")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditFramework;
