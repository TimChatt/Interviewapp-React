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
import EditFramework from "./pages/EditFramework";
import DepartmentFrameworks from "./pages/DepartmentFrameworks";
import JobTitleDetails from "./pages/JobTitleDetails";

// Import CSS files
import "./index.css"; // Global resets and base styles
import "./App.css"; // Layout styles
import "./styles.css"; // Shared styles

const AppContent = () => {
  const location = useLocation();

  // Sidebar should be hidden on Login & Signup pages
  const hideSidebarPaths = ["/login", "/signup"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className={`app-container ${shouldHideSidebar ? "no-sidebar" : ""}`}>
      {/* Sidebar (Visible except on Login/Signup pages) */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`main-content ${shouldHideSidebar ? "expanded" : ""}`}>
        <header className="app-header">Interview Analysis App</header>

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
          <Route path="/frameworks/:department" element={<DepartmentFrameworks />} />
          <Route path="/frameworks/:department/:jobTitle/:jobLevel" element={<JobTitleDetails />} />
          <Route path="/edit-framework/:id" element={<EditFramework />} />
        </Routes>

        {/* Footer */}
        {!shouldHideSidebar && <footer className="app-footer">&copy; {new Date().getFullYear()} Interview Analysis App. All rights reserved.</footer>}
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
