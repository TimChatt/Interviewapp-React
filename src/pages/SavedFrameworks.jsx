import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./SavedFrameworks.css";

const SavedFrameworks = () => {
  const [frameworks, setFrameworks] = useState([]); // Store all frameworks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize navigate hook

  // Fetch all saved frameworks from the backend
  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://interviewappbe-production.up.railway.app/api/get-frameworks" // Ensure this matches your backend route
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

  // Handle navigation to DepartmentFrameworks page
  const handleDepartmentClick = (department) => {
    navigate(`/frameworks/${department}`);
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
            <div
              key={framework.department}
              className="department-container"
              onClick={() => handleDepartmentClick(framework.department)} // Navigate on click
            >
              <h2 className="department-title">{framework.department}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedFrameworks;
