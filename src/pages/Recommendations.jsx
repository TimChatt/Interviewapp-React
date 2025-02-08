import React, { useState } from "react";
import "./Recommendations.css"; // For styling the Recommendations page

const mockCandidates = [
  {
    candidate_id: "1",
    name: "Alice Smith",
    department: "Engineering",
    scorecard: {
      technical: 4,
      communication: 3,
      leadership: 4,
    },
  },
  {
    candidate_id: "2",
    name: "Bob Johnson",
    department: "Operations",
    scorecard: {
      technical: 3,
      communication: 4,
      leadership: 4.5,
    },
  },
];

const mockRoles = [
  { role: "Software Engineer", requiredSkills: { technical: 4, communication: 3 } },
  { role: "Project Manager", requiredSkills: { communication: 4, leadership: 4 } },
  { role: "Operations Lead", requiredSkills: { technical: 3, leadership: 4 } },
];

const Recommendations = () => {
  const [recommendedRoles, setRecommendedRoles] = useState([]);

  const calculateRecommendations = () => {
    const recommendations = mockCandidates.map((candidate) => {
      const matchingRoles = mockRoles.filter((role) => {
        const requiredSkills = role.requiredSkills;
        const candidateSkills = candidate.scorecard;

        return Object.keys(requiredSkills).every(
          (skill) => candidateSkills[skill] >= requiredSkills[skill]
        );
      });

      return {
        candidate: candidate.name,
        roles: matchingRoles.map((role) => role.role),
      };
    });

    setRecommendedRoles(recommendations);
  };

  return (
    <div className="recommendations-page">
      <h1>Candidate Recommendations</h1>
      <button className="generate-button" onClick={calculateRecommendations}>
        Generate Recommendations
      </button>

      {recommendedRoles.length > 0 && (
        <div className="recommendations-section">
          {recommendedRoles.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <h3>{rec.candidate}</h3>
              <p>Recommended Roles:</p>
              <ul>
                {rec.roles.length > 0 ? (
                  rec.roles.map((role, idx) => <li key={idx}>{role}</li>)
                ) : (
                  <li>No suitable roles found</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;

