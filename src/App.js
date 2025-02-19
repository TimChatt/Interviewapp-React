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
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute

// Import CSS files
import "./index.css"; // Global resets and base styles
import "./App.css";   // Layout styles
import "./styles.css"; // Shared styles

const AppContent = () => {
  const location = useLocation();

  // Sidebar should be hidden on Login & Signup pages
  const hideSidebarPaths = ["/login", "/signup"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className={`app-container ${shouldHideSidebar ? "no-sidebar" : ""}`}>
      {!shouldHideSidebar && <Sidebar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/candidates" element={<PrivateRoute><Candidate /></PrivateRoute>} />
        <Route path="/candidate/:candidateId" element={<PrivateRoute><CandidateProfile /></PrivateRoute>} />
        <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/competency-framework-planner" element={<PrivateRoute><CompetencyFrameworkPlanner /></PrivateRoute>} />
        <Route path="/frameworks" element={<PrivateRoute><SavedFrameworks /></PrivateRoute>} />
        <Route path="/frameworks/:department" element={<PrivateRoute><DepartmentFrameworks /></PrivateRoute>} />
        <Route path="/frameworks/:department/:jobTitle/:jobLevel" element={<PrivateRoute><JobTitleDetails /></PrivateRoute>} />
        <Route path="/edit-framework/:id" element={<PrivateRoute><EditFramework /></PrivateRoute>} />
      </Routes>
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
