import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CandidateSearch from "./pages/CandidateSearch";
import CandidateProfile from "./pages/CandidateProfile";
import Trends from "./pages/Trends";
import AIvsActualScores from "./pages/AIvsActualScores";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Reporting from "./pages/Reporting";
import Recommendations from "./pages/Recommendations";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/candidate/search" element={<CandidateSearch />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/insights/trends" element={<Trends />} />
          <Route path="/insights/ai" element={<AIvsActualScores />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/security" element={<Security />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
