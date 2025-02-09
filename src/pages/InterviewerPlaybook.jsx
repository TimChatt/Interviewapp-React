// src/pages/InterviewerPlaybook.jsx
import React, { useState } from "react";
import trainingData from "../mockdata/InterviewerTrainingMock.json";
import "./InterviewerPlaybook.css";

const InterviewerPlaybook = () => {
  const [selectedJob, setSelectedJob] = useState("Frontend Engineer");

  // Find the data for the selected job
  const playbook = trainingData.find((job) => job.jobTitle === selectedJob);

  return (
    <div className="playbook-page">
      <h1>Interviewer Playbook</h1>
      <div className="job-selector">
        <label htmlFor="jobTitle">Select Job Title:</label>
        <select
          id="jobTitle"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          {trainingData.map((job) => (
            <option key={job.jobTitle} value={job.jobTitle}>
              {job.jobTitle}
            </option>
          ))}
        </select>
      </div>
      {playbook ? (
        <div className="playbook-content">
          {playbook.questions.map((q, idx) => (
            <div key={idx} className="playbook-card">
              <h2>{q.category}</h2>
              <p><strong>Question:</strong> {q.question}</p>
              <p><strong>Expected Answer:</strong> {q.expectedAnswer}</p>
              <p><strong>Follow-up:</strong> {q.followUp}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No playbook available for this job title.</p>
      )}
    </div>
  );
};

export default InterviewerPlaybook;

