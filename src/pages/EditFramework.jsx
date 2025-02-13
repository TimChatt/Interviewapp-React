import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditFramework.css";

const EditFramework = () => {
  const { id } = useParams(); // Get framework ID from the URL
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null); // Store framework details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedFramework, setUpdatedFramework] = useState({
    department: "",
    job_title: "",
    job_levels: "",
    competencies: [],
  });

  // Fetch the framework details by ID
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
        setUpdatedFramework({
          department: data.department,
          job_title: data.job_title,
          job_levels: data.job_levels,
          competencies: data.competencies,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching framework:", err);
        setError("Failed to fetch framework details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedFramework((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to update the framework
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/update-framework/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFramework),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      navigate("/frameworks"); // Redirect to the frameworks page after successful update
    } catch (err) {
      console.error("Error updating framework:", err);
      setError("Failed to update framework. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-framework-container">
      <h1>Edit Framework</h1>
      {framework && (
        <form onSubmit={handleSubmit} className="edit-framework-form">
          <div className="form-group">
            <label htmlFor="department">Department:</label>
            <input
              type="text"
              id="department"
              name="department"
              value={updatedFramework.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job_title">Job Title:</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={updatedFramework.job_title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job_levels">Job Levels:</label>
            <input
              type="text"
              id="job_levels"
              name="job_levels"
              value={updatedFramework.job_levels}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="competencies">Competencies (JSON format):</label>
            <textarea
              id="competencies"
              name="competencies"
              value={JSON.stringify(updatedFramework.competencies, null, 2)}
              onChange={(e) =>
                setUpdatedFramework((prev) => ({
                  ...prev,
                  competencies: JSON.parse(e.target.value),
                }))
              }
              required
            />
          </div>
          <button type="submit" className="save-button">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/frameworks")}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default EditFramework;
