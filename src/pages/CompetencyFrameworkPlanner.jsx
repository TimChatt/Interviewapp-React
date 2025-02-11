import React, { useState } from 'react';

const CompetencyFrameworkPlanner = () => {
  const [framework, setFramework] = useState({
    department: "",
    jobTitle: "",
    jobLevels: [],
    competencies: [],
  });

  const [newJobLevel, setNewJobLevel] = useState("");
  const [newCompetency, setNewCompetency] = useState("");

  const handleInputChange = (field, value) => {
    setFramework((prev) => ({ ...prev, [field]: value }));
  };

  const addJobLevel = () => {
    if (newJobLevel.trim()) {
      setFramework((prev) => ({
        ...prev,
        jobLevels: [...prev.jobLevels, newJobLevel.trim()],
      }));
      setNewJobLevel("");
    }
  };

  const addCompetency = () => {
    if (newCompetency.trim() && framework.jobLevels.length > 0) {
      setFramework((prev) => ({
        ...prev,
        competencies: [
          ...prev.competencies,
          { name: newCompetency.trim(), levels: framework.jobLevels.map(() => "Auto-Generated") },
        ],
      }));
      setNewCompetency("");
    }
  };

  const autoDefineCompetencies = () => {
    setFramework((prev) => {
      const updatedCompetencies = prev.competencies.map((competency) => {
        return {
          ...competency,
          levels: prev.jobLevels.map((level, index) => `Level ${index + 1} competency for ${level}`),
        };
      });
      return { ...prev, competencies: updatedCompetencies };
    });
  };

  const updateCompetencyLevel = (competencyIndex, levelIndex, value) => {
    setFramework((prev) => {
      const updatedCompetencies = [...prev.competencies];
      updatedCompetencies[competencyIndex].levels[levelIndex] = value;
      return { ...prev, competencies: updatedCompetencies };
    });
  };

  const saveFramework = async () => {
    try {
      const response = await fetch('https://interviewappbe-production.up.railway.app/api/competency-framework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework),
      });
      if (response.ok) {
        alert('Competency framework saved successfully!');
      } else {
        alert('Failed to save competency framework.');
      }
    } catch (error) {
      console.error('Error saving framework:', error);
      alert('An error occurred while saving the framework.');
    }
  };

  return (
    <div className="competency-framework-planner">
      <div className="card">
        <div className="card-content">
          <h1 className="title">Competency Framework Planner</h1>
          <div className="form-grid">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={framework.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Enter department"
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={framework.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div className="form-group">
              <label>Job Levels</label>
              <div className="input-group">
                <input
                  type="text"
                  value={newJobLevel}
                  onChange={(e) => setNewJobLevel(e.target.value)}
                  placeholder="Enter job level"
                />
                <button onClick={addJobLevel}>Add</button>
              </div>
              <ul className="job-level-list">
                {framework.jobLevels.map((level, index) => (
                  <li key={index}>{level}</li>
                ))}
              </ul>
            </div>
            <div className="form-group">
              <label>Add Competency</label>
              <div className="input-group">
                <input
                  type="text"
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  placeholder="Competency name"
                />
                <button onClick={addCompetency}>Add</button>
              </div>
            </div>
            <div className="form-group">
              <button onClick={autoDefineCompetencies}>Auto-Define Competencies</button>
            </div>
            <div className="form-group">
              <button onClick={saveFramework}>Save Framework</button>
            </div>
          </div>
          <div className="competencies-list">
            <h2>Competencies:</h2>
            {framework.competencies.map((competency, compIndex) => (
              <div key={compIndex} className="competency-item">
                <h3>{competency.name}</h3>
                <ul>
                  {framework.jobLevels.map((level, levelIndex) => (
                    <li key={levelIndex}>
                      <span>{level}:</span>
                      <input
                        type="text"
                        value={competency.levels[levelIndex]}
                        onChange={(e) =>
                          updateCompetencyLevel(compIndex, levelIndex, e.target.value)
                        }
                        placeholder="Define competency"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyFrameworkPlanner;
