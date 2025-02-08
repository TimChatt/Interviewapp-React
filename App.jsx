import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Placeholder pages for now
const Home = () => <h1>Home</h1>;
const CandidateSearch = () => <h1>Candidate Search</h1>;
const CandidateProfile = () => <h1>Candidate Profile</h1>;
const InsightsTrends = () => <h1>Insights Trends</h1>;
const InsightsAI = () => <h1>AI vs Actual Scores</h1>;
const AdminSettings = () => <h1>Admin Settings</h1>;
const AdminSecurity = () => <h1>Admin Security</h1>;
const Reporting = () => <h1>Reporting</h1>;
const Recommendations = () => <h1>Recommendations</h1>;

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/candidate/search" element={<CandidateSearch />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/insights/trends" element={<InsightsTrends />} />
          <Route path="/insights/ai" element={<InsightsAI />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

