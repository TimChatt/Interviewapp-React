// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import CandidateProfile from "./pages/CandidateProfile";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CompetencyFrameworkPlanner from "./pages/CompetencyFrameworkPlanner";
import SavedFrameworks from "./pages/SavedFrameworks";
import DepartmentFrameworks from "./pages/DepartmentFrameworks"; // Import DepartmentFrameworks page
import JobTitleDetails from "./pages/JobTitleDetails"; // Import JobTitleDetails page
import "./index.css"; // Ensure global styles are included

const AppContent = () => {
  const location = useLocation();

  // Define paths where the Sidebar should be hidden
  const hideSidebarPaths = ["/login", "/signup"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className={`app-container ${shouldHideSidebar ? "no-sidebar" : ""}`}>
      {/* Conditionally render Sidebar */}
      {!shouldHideSidebar && <Sidebar />}
      {/* Main content area */}
      <div className={`main-content ${shouldHideSidebar ? "expanded" : ""}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Home />} />
          <Route path="/candidates" element={<Candidate />} />
          <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/competency-framework-planner" element={<CompetencyFrameworkPlanner />} />
          <Route path="/frameworks" element={<SavedFrameworks />} />
          <Route path="/frameworks/:department" element={<DepartmentFrameworks />} /> {/* Add route for DepartmentFrameworks */}
          <Route path="/frameworks/:department/:jobTitle" element={<JobTitleDetails />} /> {/* Add route for JobTitleDetails */}
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;

