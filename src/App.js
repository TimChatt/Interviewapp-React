// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import CandidateProfile from "./pages/CandidateProfile";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import CompetencyFrameworkPlannerPage from "./pages/CompetencyFrameworkPlanner";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard"; // New admin dashboard page
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

const AppContent = () => {
  const location = useLocation();

  // Define paths where the NavigationBar should be hidden
  const hideNavBarPaths = ["/login", "/signup"];
  const shouldHideNavBar = hideNavBarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavBar && <NavigationBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/candidates" element={<Candidate />} />
          <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/competency-planner" element={<CompetencyFrameworkPlannerPage />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
