import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SavedFrameworks = () => {
  const [allFrameworks, setAllFrameworks] = useState([]); // Store all frameworks fetched from backend
  const [displayedFrameworks, setDisplayedFrameworks] = useState([]); // Frameworks to display based on search query
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const navigate = useNavigate();

  // Fetch all frameworks from the backend on component mount
  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/search-frameworks?query=`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched all frameworks:", data.frameworks); // Debugging log
        setAllFrameworks(data.frameworks || []);
        setDisplayedFrameworks(data.frameworks || []); // Display all frameworks initially
        setError(null);
      } catch (err) {
        console.error("Error fetching frameworks:", err);
        setError("Failed to fetch saved frameworks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []); // Run once on component mount

  // Update displayed frameworks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search query is empty, display all frameworks
      setDisplayedFrameworks(allFrameworks);
    } else {
      // Filter frameworks based on the search query
      const filteredFrameworks = allFrameworks.filter((framework) =>
        framework.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        framework.job_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedFrameworks(filteredFrameworks);
    }
  }, [searchQuery, allFrameworks]);

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
      setAllFrameworks(allFrameworks.filter((framework) => framework.id !== id));
    } catch (error) {
      console.error("Error deleting framework:", error);
      alert("An error occurred while deleting the framework. Please try again.");
    }
  };

  // Handle framework editing
  const handleEdit = (id) => {
    navigate(`/edit-framework/${id}`);
  };

  return (
    <div className="saved-frameworks">
      <h1 className="saved-frameworks-title">Saved Competency Frameworks</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by department or job title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading Spinner */}
      {loading && <div className="loading-spinner">Loading...</div>}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Empty State */}
      {!loading && !error && displayedFrameworks.length === 0 && (
        <div className="no-frameworks-message">
          <p>No saved frameworks found. Start by generating a new framework.</p>
          <button
            className="create-framework-button"
            onClick={() => navigate("/competency-framework-planner")}
          >
            Generate New Framework
          </button>
        </div>
      )}

      {/* Frameworks Grid */}
      {!loading && !error && displayedFrameworks.length > 0 && (
        <div className="grid-container">
          {displayedFrameworks.map((framework) => (
            <div key={framework.id} className="grid-item">
              <div
                className="framework-card"
                onClick={() => handleDepartmentClick(framework.department)}
              >
                <h3>{framework.department}</h3>
                <p>{framework.job_title}</p>
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

