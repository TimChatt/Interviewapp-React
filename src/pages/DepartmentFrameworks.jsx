// ... inside DepartmentFrameworks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles.css';
import JobTitleDetailsModal from "./JobTitleDetailsModal";

const DepartmentFrameworks = () => {
  const { department } = useParams();
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchDepartmentJobTitles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-job-titles?department=${department}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }
        const data = await response.json();
        setJobTitles(data.job_titles || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching department job titles:", err);
        setError("Failed to fetch job titles for this department. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentJobTitles();
  }, [department]);

  const openModal = (jobTitle) => {
    const levels = ["L1", "L2", "L3", "L4"];
    const jobLevel = levels.find(level => jobTitle.includes(level)) || "L1";
    setSelectedDetails({ department, jobTitle, jobLevel });
    setIsModalOpen(true);
  };

  const handleEdit = (jobTitle) => {
    navigate(`/edit-framework/${jobTitle}`);
  };

  return (
    <div className="department-frameworks-container">
      <h1>{department} Frameworks</h1>
      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && jobTitles.length === 0 && (
        <div className="no-job-titles-message">
          <p>No job titles found for this department.</p>
        </div>
      )}
      {!loading && !error && jobTitles.length > 0 && (
        <div className="job-titles-grid">
          {jobTitles.map((job, index) => (
            <div key={index} className="job-title-card">
              <h3>{job.job_title}</h3>
              <button onClick={() => openModal(job.job_title)}>View Details</button>
              <button onClick={() => handleEdit(job.job_title)}>Edit Framework</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal with job details */}
      {selectedDetails && (
        <JobTitleDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          department={selectedDetails.department}
          jobTitle={selectedDetails.jobTitle}
          jobLevel={selectedDetails.jobLevel}
        />
      )}
    </div>
  );
};

export default DepartmentFrameworks;
