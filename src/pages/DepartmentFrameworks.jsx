import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [frameworks, setFrameworks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await fetch(
          "https://interviewappbe-production.up.railway.app/api/get-frameworks"
        );
        const data = await response.json();
        const departmentFrameworks = data.frameworks.filter(
          (fw) => fw.department === department
        );
        setFrameworks(departmentFrameworks);
      } catch (error) {
        console.error("Error fetching frameworks:", error);
      }
    };

    fetchFrameworks();
  }, [department]);

  const handleJobTitleClick = (jobTitle) => {
    navigate(`/frameworks/${department}/${jobTitle}`);
  };

  return (
    <div className="department-frameworks">
      <h1>{department} Frameworks</h1>
      {frameworks.map((framework, index) => (
        <div
          key={index}
          className="job-title-container"
          onClick={() => handleJobTitleClick(framework.jobTitle)}
        >
          <h2>{framework.jobTitle}</h2>
        </div>
      ))}
    </div>
  );
};

export default DepartmentFrameworks;
