import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./SavedFrameworks.css";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]); // Store all frameworks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const navigate = useNavigate(); // Initialize navigation hook

  // Fetch all saved frameworks from the backend
  useEffect(() => {
    const fetchFrameworks = async (query = "") => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=${query}` // Search functionality
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

    fetchFrameworks(searchQuery);
  }, [searchQuery]); // Re-fetch frameworks when the search query changes

  // Handle navigation to DepartmentFrameworks page
  const handleDepartmentClick = (department) => {
    navigate(`/frameworks/${department}`);
  };

  // Handle framework deletion
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this framework?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/delete-framework/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete framework");
      }

      alert("Framework deleted successfully!");
      setFrameworks(frameworks.filter((framework) => framework.id !== id)); // Remove the deleted framework from state
    } catch (error) {
      console.error("Error deleting framework:", error);
      alert("An error occurred while deleting the framework.");
    }
  };

  // Handle framework editing
  const handleEdit = (id) => {
    navigate(`/edit-framework/${id}`); // Redirect to an edit page or modal
  };

  return (
    <div className="saved-frameworks-container">
      <h1 className="saved-frameworks-title">Saved Competency Frameworks</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by department or job title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && frameworks.length === 0 && (
        <div className="no-frameworks-message">
          No saved frameworks found. Start by generating a new framework.
        </div>
      )}

      {!loading && !error && frameworks.length > 0 && (
        <div className="frameworks-list">
          {frameworks.map((framework) => (
            <div key={framework.id} className="framework-item">
              <div
                className="framework-info"
                onClick={() => handleDepartmentClick(framework.department)} // Navigate on click
              >
                <h2 className="framework-title">{framework.department}</h2>
                <p className="framework-job-title">{framework.job_title}</p>
              </div>
              <div className="framework-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(framework.id)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(framework.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedFrameworks;
