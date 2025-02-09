import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";  // We'll assume this is the "CandidateTable" view
import CandidateProfile from "./pages/CandidateProfile"; // New file we create for single-candidate detail
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* List/Table of candidates */}
        <Route path="/candidates" element={<Candidate />} />

        {/* Single candidate detail page, parameterized by ID */}
        <Route path="/candidate/:candidateId" element={<CandidateProfile />} />

        <Route path="/insights" element={<Insights />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
