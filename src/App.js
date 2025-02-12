import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Sidebar for navigation
import Home from "./pages/Home";
import CandidateSearch from "./pages/CandidateSearch";
import CandidateProfile from "./pages/CandidateProfile";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard"; // Sub-area under Admin
import CompetencyFrameworkPlanner from "./pages/CompetencyFrameworkPlanner";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar /> {/* Sidebar Navigation */}
        <div className="main-content"> {/* Main wrapper */}
          <Routes>
            {/* Main sections */}
            <Route path="/" element={<Home />} />
            <Route path="/candidate/search" element={<CandidateSearch />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />

            {/* Admin section with collapsible sub-area */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Competency Framework Planner */}
            <Route
              path="/competency-framework-planner"
              element={<CompetencyFrameworkPlanner />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

