import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";  // The Candidate Table/List page
import CandidateProfile from "./pages/CandidateProfile"; // Single candidate detail
import Insights from "./pages/Insights";
import InterviewerPlaybook from "./pages/InterviewerPlaybook";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidates" element={<Candidate />} />
        <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/interviewer-playbook" element={<InterviewerPlaybook />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;

