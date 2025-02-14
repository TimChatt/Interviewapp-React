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
        setAllFrameworks(data.frameworks || []);
        setDisplayedFrameworks(data.frameworks || []);
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
      const filteredFrameworks = allFrameworks.filter((framework) =>
        framework.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        framework.job_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedFrameworks(filteredFrameworks);
    }
  }, [searchQuery, allFrameworks]);

  const handleDepartmentClick = (department) => {
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
          placeholder="Search by department or job title"
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
                {displayedFrameworks.map((framework, index) => (
                  <Draggable key={framework.id} draggableId={framework.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`framework-card ${snapshot.isDragging ? "dragging" : ""}`}
                        onClick={(e) => {
                          if (!snapshot.isDragging) {
                            handleDepartmentClick(framework.department);
                          }
                        }}
                      >
                        <div className="framework-content">
                          {/* If department is Engineering, show an inline SVG */}
                          {framework.department.includes("Engineering") && (
                            <svg
                              className="engineering-icon"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7zm0-9a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                          <h3>{framework.department}</h3>
                        </div>
                        <p>{framework.job_title}</p>
                        <div className="framework-actions">
                          <button
                            className="edit-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(framework.id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(framework.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
