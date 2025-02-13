import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import { useDebounce } from "use-debounce"; // Install with npm: npm install use-debounce
import "./SavedFrameworks.css";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]); // Store all frameworks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300); // Debounce for search input
  const navigate = useNavigate(); // Initialize navigation hook

  // Fetch all saved frameworks from the backend
  useEffect(() => {
    const fetchFrameworks = async (query = "") => {
      setLoading(true);
      try {
        if (!query.trim() && query === "") {
          // Prevent empty query API calls
          setFrameworks([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=${query}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
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

    fetchFrameworks(debouncedSearchQuery);
  }, [debouncedSearchQuery]); // Re-fetch frameworks when the debounced search query changes

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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete framework");
      }

      alert("Framework deleted successfully!");
      setFrameworks(frameworks.filter((framework) => framework.id !== id)); // Remove the deleted framework from state
    } catch (error) {
      console.error("Error deleting framework:", error);
      alert("An error occurred while deleting the framework. Please try again.");
    }
  };

  // Handle framework editing
  const handleEdit = (id) => {
    navigate(`/edit-framework/${id}`); // Redirect to an edit page or modal
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <div className="saved-frameworks-container">
      <h1 className="saved-frameworks-title">Saved Competency Frameworks</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by department or job title"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Loading Spinner */}
      {loading && <div className="loading-spinner">Loading...</div>}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Empty State */}
      {!loading && !error && frameworks.length === 0 && (
        <div className="no-frameworks-message">
          <p>No saved frameworks found. Start by generating a new framework.</p>
          <button
            className="create-framework-button"
            onClick={() => navigate("/generate-framework")}
          >
            Generate New Framework
          </button>
        </div>
      )}

      {/* Frameworks List */}
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
