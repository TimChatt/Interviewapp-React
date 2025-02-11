import React, { useState } from "react";

const CompetencyFramework = () => {
  const [framework, setFramework] = useState({
    department: "",
    jobTitle: "",
    jobLevels: [],
    competencies: [],
  });
  const [generatedDescriptions, setGeneratedDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const autoGenerateDescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/generate-competencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department: framework.department,
          jobTitle: framework.jobTitle,
          jobLevels: framework.jobLevels,
          competencies: framework.competencies.map((c) => c.name),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the state with the new descriptions
        setGeneratedDescriptions(data.competencyDescriptions);
        setFramework((prev) => ({
          ...prev,
          competencies: prev.competencies.map((competency, index) => ({
            ...competency,
            descriptions: data.competencyDescriptions[index]?.levels || {},
          })),
        }));
      } else {
        alert("Failed to generate descriptions.");
      }
    } catch (error) {
      console.error("Error generating descriptions:", error);
      alert("An error occurred while generating descriptions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Competency Framework Generator</h1>
      {/* Framework input form */}
      <div>
        <input
          type="text"
          placeholder="Department"
          value={framework.department}
          onChange={(e) =>
            setFramework((prev) => ({ ...prev, department: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Job Title"
          value={framework.jobTitle}
          onChange={(e) =>
            setFramework((prev) => ({ ...prev, jobTitle: e.target.value }))
          }
        />
        <textarea
          placeholder="Job Levels (comma separated)"
          value={framework.jobLevels.join(", ")}
          onChange={(e) =>
            setFramework((prev) => ({
              ...prev,
              jobLevels: e.target.value.split(",").map((level) => level.trim()),
            }))
          }
        />
        <textarea
          placeholder="Competencies (comma separated)"
          value={framework.competencies.map((c) => c.name).join(", ")}
          onChange={(e) =>
            setFramework((prev) => ({
              ...prev,
              competencies: e.target.value.split(",").map((name) => ({ name })),
            }))
          }
        />
      </div>

      {/* Generate button */}
      <button onClick={autoGenerateDescriptions} disabled={loading}>
        {loading ? "Generating..." : "Generate Descriptions"}
      </button>

      {/* Display the generated descriptions */}
      <div>
        <h2>Generated Competency Descriptions</h2>
        {generatedDescriptions.map((desc, index) => (
          <div key={index}>
            <h3>{desc.competency}</h3>
            {Object.entries(desc.levels).map(([level, description]) => (
              <p key={level}>
                <strong>{level}:</strong> {description}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyFramework;
