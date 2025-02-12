import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const JobTitleDetails = () => {
  const { department, jobTitle } = useParams();
  const [framework, setFramework] = useState(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await fetch(
          "https://interviewappbe-production.up.railway.app/api/get-frameworks"
        );
        const data = await response.json();
        const selectedFramework = data.frameworks.find(
          (fw) => fw.department === department && fw.jobTitle === jobTitle
        );
        setFramework(selectedFramework);
      } catch (error) {
        console.error("Error fetching framework:", error);
      }
    };

    fetchFrameworks();
  }, [department, jobTitle]);

  if (!framework) {
    return <div>Loading...</div>;
  }

  return (
    <div className="job-title-details">
      <h1>{framework.jobTitle}</h1>
      <h2>Competencies:</h2>
      {framework.competencies.map((competency, index) => (
        <div key={index} className="competency-card">
          <h3>{competency.name}</h3>
          {Object.entries(competency.descriptions).map(([level, description]) => (
            <div key={level}>
              <strong>{level}:</strong> {description}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default JobTitleDetails;
