import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./SavedFrameworks.css";

const SavedFrameworks = () => {
  const [allFrameworks, setAllFrameworks] = useState([]);
  const [displayedFrameworks, setDisplayedFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
        console.log("Fetched all frameworks:", data.frameworks);

        // Group frameworks by department
        const frameworksByDepartment = data.frameworks.reduce((acc, framework) => {
          if (!acc[framework.department]) {
            acc[framework.department] = [];
          }
          // If job_titles is included in the framework, add them to the department group
          acc[framework.department].push({
            ...framework,
            jobTitles: framework.job_titles || [], // Ensure job_titles exist
          });
          return acc;
        }, {});

        // Convert the grouped data to an array for rendering
        const groupedFrameworks = Object.entries(frameworksByDepartment).map(([department, frameworks]) => ({
          department,
          frameworks,
        }));

        setAllFrameworks(groupedFrameworks);
        setDisplayedFrameworks(groupedFrameworks);
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayedFrameworks(allFrameworks);
    } else {
      const filteredFrameworks = allFrameworks.filter((group) =>
        group.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedFrameworks(filteredFrameworks);
    }
  }, [searchQuery, allFrameworks]);

  const handleDepartmentClick = (department) => {
    // Navigate to the department's detailed page
    navigate(`/frameworks/${department}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this framework?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/delete-framework/${id}`,
        { method: "DELETE" }
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

  const handleEdit = (id) => {
    navigate(`/edit-framework/${id}`);
  };

  // Drag and drop handler
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFrameworks = Array.from(displayedFrameworks);
    const [movedFramework] = reorderedFrameworks.splice(result.source.index, 1);
    reorderedFrameworks.splice(result.destination.index, 0, movedFramework);

    setDisplayedFrameworks(reorderedFrameworks);
    setAllFrameworks(reorderedFrameworks);
  };

  return (
    <div className="saved-frameworks-container">
      <h1 className="saved-frameworks-title">Saved Competency Frameworks</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by department"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

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

      {/* Drag and Drop Enabled Frameworks Grid */}
      {!loading && !error && displayedFrameworks.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="frameworks">
            {(provided) => (
              <div
                className="grid-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {displayedFrameworks.map((group, index) => (
                  <Draggable key={group.department} draggableId={group.department} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="department-container"
                        onClick={() => handleDepartmentClick(group.department)} // Navigate to department page
                      >
                        <h3>{group.department}</h3> {/* Only show the department name */}
                        {/* Show job titles */}
                        <ul>
                          {group.frameworks.map((framework, idx) => (
                            <li key={idx}>
                              {framework.jobTitles.map((title, titleIndex) => (
                                <div key={titleIndex}>{title.job_title}</div>
                              ))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default SavedFrameworks;
